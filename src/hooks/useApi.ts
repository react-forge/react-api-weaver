import { useEffect, useRef, useState, useCallback } from 'react';
import { UseApiOptions, UseApiResult, ApiFunction } from '../types';
import { createCache, generateCacheKey } from '../core/cache';
import { createPollingManager } from '../core/polling';

// Global cache manager to persist cache across renders
const globalCacheManager = createCache();

/**
 * Base hook for API requests with caching, polling, and abort support
 */
export function useApi<TData = any, TParams = any>(
  apiFunction: ApiFunction<TData, TParams> | (() => Promise<TData>),
  options: UseApiOptions<TData> = {},
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'
): UseApiResult<TData> {
  const {
    cache = method === 'GET', // Enable cache by default for GET requests
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

  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingManagerRef = useRef(createPollingManager());
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  /**
   * Execute the API request
   */
  const executeRequest = useCallback(
    async (useCache: boolean = true): Promise<void> => {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        // Generate cache key if caching is enabled
        const cacheKey =
          cache && useCache
            ? generateCacheKey(
                apiFunction.name || 'api',
                {},
                typeof cache === 'object' ? cache.key : undefined
              )
            : '';

        // Check cache first for GET requests
        if (cache && useCache && method === 'GET') {
          const cachedData = globalCacheManager.get<TData>(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            onSuccess?.(cachedData);
            return;
          }
        }

        // Execute the API function
        const result = await apiFunction();

        if (!mountedRef.current) return;

        // Cache the result if caching is enabled
        if (cache && method === 'GET') {
          const ttl =
            typeof cache === 'object' && cache.ttl ? cache.ttl : 300000;
          globalCacheManager.set(cacheKey, result, ttl);
        }

        setData(result);
        setLoading(false);
        retryCountRef.current = 0;
        onSuccess?.(result);
      } catch (err: any) {
        if (!mountedRef.current) return;

        const error = err instanceof Error ? err : new Error(String(err));

        // Handle retry logic
        const shouldRetry =
          typeof retry === 'number' ? retryCountRef.current < retry : retry;

        if (shouldRetry && error.message !== 'Request was aborted') {
          retryCountRef.current++;
          setTimeout(() => {
            executeRequest(false);
          }, retryDelay);
          return;
        }

        setError(error);
        setLoading(false);
        onError?.(error);
      }
    },
    [apiFunction, cache, method, onSuccess, onError, retry, retryDelay]
  );

  /**
   * Refetch function to manually trigger a request
   */
  const refetch = useCallback(async (): Promise<void> => {
    await executeRequest(false);
  }, [executeRequest]);

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

    // Execute initial request
    executeRequest();

    // Setup polling if specified
    if (polling && polling > 0) {
      pollingManagerRef.current.start(() => executeRequest(true), polling);
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
      abort();
    };
  }, [enabled, polling, executeRequest, abort]);

  return {
    data,
    loading,
    error,
    refetch,
    abort,
  };
}

