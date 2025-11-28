import { UseApiOptimisticOptions, UseApiOptimisticResult, ApiFunction } from '../types';
import { useApiOptimistic } from './useApiOptimistic';

/**
 * Hook for PUT requests with optimistic updates (React 19+)
 * Falls back to regular mutation for React 17/18
 * 
 * @param apiFunction - The API function to execute
 * @param options - Configuration options with optimistic update function
 * @returns API result with optimistic data and mutate function
 */
export function usePutOptimistic<TData = any, TInput = any>(
  apiFunction: ApiFunction<TData, TInput> | ((input: TInput) => Promise<TData>),
  options: UseApiOptimisticOptions<TData, TInput> = {}
): UseApiOptimisticResult<TData, TInput> {
  return useApiOptimistic<TData, TInput>(apiFunction, {
    ...options,
    cache: false, // PUT requests shouldn't be cached
  });
}

