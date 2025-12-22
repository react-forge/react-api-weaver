import { use, useCallback, useRef, useState, useTransition, useEffect } from 'react';
import { 
  UseApiOptions, 
  UseApiResult, 
  ApiFunction,
  UseSuspenseApiResult,
  UseSuspenseApiOptions,
} from '../../types';
import { createCachedFetch, cacheManager, generateCacheKey } from './cache';
import { createPollingManager } from '../../core/polling';

// Promise cache for Suspense
const promiseCache = new Map<string, Promise<any>>();

/**
 * Suspense-based hook for API requests (React 19)
 * Uses React's `use` hook to unwrap promises directly
 * Must be used within a Suspense boundary
 * 
 * @param apiFunction - The API function that returns a Promise
 * @param options - Configuration options
 * @returns The resolved data (throws promise for Suspense)
 */
export function useSuspenseApi<TData = any, TParams = any>(
  apiFunction: ApiFunction<TData, TParams> | (() => Promise<TData>),
  options: UseSuspenseApiOptions<TData> = {}
): UseSuspenseApiResult<TData> {
  const {
    cache: cacheConfig = true,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const abortControllerRef = useRef<AbortController | null>(null);
  const [, setRefetchTrigger] = useState(0);

  // Generate a cache key for this request
  const cacheKey = generateCacheKey(
    apiFunction.name || 'api',
    {},
    typeof cacheConfig === 'object' ? cacheConfig.key : undefined
  );

  // Get or create the promise
  let fetchPromise: Promise<TData>;
  
  if (!enabled) {
    fetchPromise = Promise.resolve(null as unknown as TData);
  } else if (cacheConfig && promiseCache.has(cacheKey)) {
    fetchPromise = promiseCache.get(cacheKey)!;
  } else {
    // Create cached version of the API function
    const cachedApiFunction = cacheConfig
      ? createCachedFetch(apiFunction as () => Promise<TData>, 
          typeof cacheConfig === 'object' ? cacheConfig : undefined
        )
      : apiFunction;

    fetchPromise = cachedApiFunction().then(
      (data) => {
        if (onSuccess) {
          Promise.resolve().then(() => onSuccess(data));
        }
        return data;
      },
      (err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        if (onError) {
          Promise.resolve().then(() => onError(error));
        }
        throw error;
      }
    );

    if (cacheConfig) {
      promiseCache.set(cacheKey, fetchPromise);
    }
  }

  // Use React 19's use() hook to unwrap the promise
  // This will suspend the component until the promise resolves
  const data = use(fetchPromise);

  /**
   * Refetch function to manually trigger a new request
   */
  const refetch = useCallback(async (): Promise<void> => {
    // Invalidate both promise cache and data cache
    promiseCache.delete(cacheKey);
    cacheManager.delete(cacheKey);
    // Trigger re-render to fetch new data
    setRefetchTrigger((prev) => prev + 1);
  }, [cacheKey]);

  /**
   * Abort function to cancel the current request
   * Note: In Suspense mode, abort has limited effect on cached promises
   */
  const abort = useCallback((): void => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }
    abortControllerRef.current.abort();
  }, []);

  return {
    data,
    refetch,
    abort,
  };
}

/**
 * Standard hook for API requests (React 19)
 * Uses useState with useTransition for better concurrent rendering
 * Leverages React 19's native cache for request deduplication
 */
export function useApi<TData = any, TParams = any>(
  apiFunction: ApiFunction<TData, TParams> | (() => Promise<TData>),
  options: UseApiOptions<TData> = {},
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'
): UseApiResult<TData> {
  const {
    cache: cacheConfig = method === 'GET',
    polling,
    enabled = true,
    onSuccess,
    onError,
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingManagerRef = useRef(createPollingManager());
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Create cached version if caching is enabled
  const cachedApiFunction = cacheConfig && method === 'GET'
    ? createCachedFetch(apiFunction as () => Promise<TData>,
        typeof cacheConfig === 'object' ? cacheConfig : undefined
      )
    : apiFunction;

  /**
   * Execute the API request
   */
  const executeRequest = useCallback(
    async (useCache: boolean = true): Promise<void> => {
      abortControllerRef.current = new AbortController();

      startTransition(() => {
        setLoading(true);
        setError(null);
      });

      try {
        // Execute the API function (cache is handled by createCachedFetch)
        const result = useCache && cacheConfig && method === 'GET'
          ? await cachedApiFunction()
          : await apiFunction();

        if (!mountedRef.current) return;

        startTransition(() => {
          setData(result);
          setLoading(false);
        });
        
        retryCountRef.current = 0;
        onSuccess?.(result);
      } catch (err: any) {
        if (!mountedRef.current) return;

        const errorObj = err instanceof Error ? err : new Error(String(err));

        const shouldRetry =
          typeof retry === 'number' ? retryCountRef.current < retry : retry;

        if (shouldRetry && errorObj.message !== 'Request was aborted') {
          retryCountRef.current++;
          setTimeout(() => {
            executeRequest(false);
          }, retryDelay);
          return;
        }

        startTransition(() => {
          setError(errorObj);
          setLoading(false);
        });
        
        onError?.(errorObj);
      }
    },
    [apiFunction, cachedApiFunction, cacheConfig, method, onSuccess, onError, retry, retryDelay]
  );

  /**
   * Refetch function to manually trigger a request
   */
  const refetch = useCallback(async (): Promise<void> => {
    // Invalidate cache
    const cacheKey = generateCacheKey(apiFunction.name || 'api', {});
    cacheManager.delete(cacheKey);
    promiseCache.delete(cacheKey);
    await executeRequest(false);
  }, [executeRequest, apiFunction.name]);

  /**
   * Abort function to cancel the current request
   */
  const abort = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    pollingManagerRef.current.stop();
  }, []);

  // Effect to handle initial request and polling
  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      return;
    }

    executeRequest();

    if (polling && polling > 0) {
      pollingManagerRef.current.start(() => executeRequest(true), polling);
    }

    return () => {
      mountedRef.current = false;
      abort();
    };
  }, [enabled, polling, executeRequest, abort]);

  return {
    data,
    loading: loading || isPending,
    error,
    refetch,
    abort,
  };
}
