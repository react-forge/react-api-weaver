import { useState, useCallback, useRef } from 'react';
import { 
  UseApiOptimisticOptions, 
  UseApiOptimisticResult, 
  ApiFunction 
} from '../../types';

/**
 * Hook for API mutations with optimistic updates (React 18)
 * Uses regular state management for optimistic updates
 * 
 * @param apiFunction - The API function to execute
 * @param options - Configuration options with optimistic update function
 * @returns API result with optimistic data, mutate function, and abort
 */
export function useApiOptimistic<TData = any, TInput = any>(
  apiFunction: ApiFunction<TData, TInput> | ((input: TInput) => Promise<TData>),
  options: UseApiOptimisticOptions<TData, TInput> = {}
): UseApiOptimisticResult<TData, TInput> {
  const {
    optimisticUpdate,
    rollbackOnError = true,
    onSuccess,
    onError,
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);
  const previousDataRef = useRef<TData | null | undefined>(undefined);

  /**
   * Execute the mutation with optimistic update
   */
  const mutate = useCallback(
    async (input: TInput): Promise<void> => {
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        // Store previous data for rollback
        previousDataRef.current = data;

        // Apply optimistic update if provided
        if (optimisticUpdate) {
          const optimisticResult = optimisticUpdate(data, input);
          setData(optimisticResult);
        }

        // Execute the API function
        const result = await apiFunction(input as any);

        if (!mountedRef.current) return;

        // Update with actual server response
        setData(result);
        setLoading(false);
        retryCountRef.current = 0;
        onSuccess?.(result);
      } catch (err: any) {
        if (!mountedRef.current) return;

        const errorObj = err instanceof Error ? err : new Error(String(err));

        // Handle retry logic
        const shouldRetry =
          typeof retry === 'number' ? retryCountRef.current < retry : retry;

        if (shouldRetry && errorObj.message !== 'Request was aborted') {
          retryCountRef.current++;
          setTimeout(() => {
            mutate(input);
          }, retryDelay);
          return;
        }

        // Rollback optimistic update on error
        if (rollbackOnError && previousDataRef.current !== undefined) {
          setData(previousDataRef.current);
        }

        setError(errorObj);
        setLoading(false);
        onError?.(errorObj);
      }
    },
    [apiFunction, data, optimisticUpdate, onSuccess, onError, retry, retryDelay, rollbackOnError]
  );

  /**
   * Abort function to cancel the current request
   */
  const abort = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    data,
    optimisticData: data, // In React 18, optimisticData is the same as data
    loading,
    error,
    mutate,
    abort,
  };
}

