import { useState, useCallback, useRef, useOptimistic, useTransition } from 'react';
import { 
  UseApiOptimisticOptions, 
  UseApiOptimisticResult, 
  ApiFunction 
} from '../../types';

/**
 * Hook for API mutations with optimistic updates (React 19)
 * Uses native useOptimistic for instant UI updates
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
  const [isPending, startTransition] = useTransition();
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);
  const pendingOptimisticValueRef = useRef<TData | null>(null);

  // Use React 19's useOptimistic for instant optimistic updates
  const [optimisticData, setOptimisticData] = useOptimistic(
    data,
    (_currentState: TData | null, newState: TData) => newState
  );

  /**
   * Execute the mutation with optimistic update
   */
  const mutate = useCallback(
    async (input: TInput): Promise<void> => {
      abortControllerRef.current = new AbortController();

      startTransition(async () => {
        try {
          setLoading(true);
          setError(null);

          // Apply optimistic update immediately using React 19's useOptimistic
          if (optimisticUpdate) {
            const optimisticResult = optimisticUpdate(data, input);
            pendingOptimisticValueRef.current = optimisticResult;
            setOptimisticData(optimisticResult);
          }

          // Execute the API function
          const result = await apiFunction(input as any);

          if (!mountedRef.current) return;

          // Update with actual server response
          setData(result);
          pendingOptimisticValueRef.current = null;
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

          // Handle rollback behavior based on rollbackOnError option
          // React 19's useOptimistic will revert to the base 'data' state when transition ends
          // If rollbackOnError is false, persist the optimistic value to prevent rollback
          if (!rollbackOnError && pendingOptimisticValueRef.current !== null) {
            setData(pendingOptimisticValueRef.current);
          }
          
          pendingOptimisticValueRef.current = null;
          setError(errorObj);
          setLoading(false);
          onError?.(errorObj);
        }
      });
    },
    [apiFunction, data, optimisticUpdate, rollbackOnError, onSuccess, onError, retry, retryDelay, setOptimisticData]
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
    loading: loading || isPending,
    error,
    mutate,
    abort,
  };
}

