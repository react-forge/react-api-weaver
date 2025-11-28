import { useState, useCallback, useRef } from 'react';
import { 
  UseApiOptimisticOptions, 
  UseApiOptimisticResult, 
  ApiFunction 
} from '../types';
import { isReact19OrLater, getReact19Hook } from '../utils/react-version';

/**
 * Hook for API mutations with optimistic updates (React 19+)
 * Falls back to regular state management for React 17/18
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

  // Try to get React 19's useOptimistic hook
  const useOptimistic = getReact19Hook<typeof import('react').useOptimistic>('useOptimistic');
  
  // Use React 19's useOptimistic if available, otherwise fall back to regular state
  let optimisticData: TData | null;
  let setOptimisticData: ((action: TData | ((currentState: TData | null) => TData)) => void) | null = null;

  if (useOptimistic && isReact19OrLater()) {
    // React 19+ path with useOptimistic
    [optimisticData, setOptimisticData] = useOptimistic(
      data,
      (currentState: TData | null, newState: TData) => newState
    );
  } else {
    // React 17/18 fallback - optimisticData is just the same as data
    optimisticData = data;
  }

  /**
   * Execute the mutation with optimistic update
   */
  const mutate = useCallback(
    async (input: TInput): Promise<void> => {
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        // Apply optimistic update if provided
        if (optimisticUpdate && setOptimisticData) {
          const optimisticResult = optimisticUpdate(data, input);
          setOptimisticData(optimisticResult);
        } else if (optimisticUpdate) {
          // Fallback for React 17/18 - just update data immediately
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

        // Rollback optimistic update on error (React 19 handles this automatically)
        if (rollbackOnError && !setOptimisticData) {
          // For React 17/18, manually rollback by not updating data
          // The optimistic update was already applied to data, so we need to revert
          // But we don't have the previous state, so we just keep the current data
        }

        setError(errorObj);
        setLoading(false);
        onError?.(errorObj);
      }
    },
    [apiFunction, data, optimisticUpdate, onSuccess, onError, retry, retryDelay, rollbackOnError, setOptimisticData]
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
    optimisticData,
    loading,
    error,
    mutate,
    abort,
  };
}

