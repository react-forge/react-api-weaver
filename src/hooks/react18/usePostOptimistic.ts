import { UseApiOptimisticOptions, UseApiOptimisticResult, ApiFunction } from '../../types';
import { useApiOptimistic } from './useApiOptimistic';

/**
 * Hook for POST requests with optimistic updates (React 18)
 * 
 * @param apiFunction - The API function to execute
 * @param options - Configuration options with optimistic update function
 * @returns API result with optimistic data and mutate function
 */
export function usePostOptimistic<TData = any, TInput = any>(
  apiFunction: ApiFunction<TData, TInput> | ((input: TInput) => Promise<TData>),
  options: UseApiOptimisticOptions<TData, TInput> = {}
): UseApiOptimisticResult<TData, TInput> {
  return useApiOptimistic<TData, TInput>(apiFunction, {
    ...options,
    cache: false,
  });
}

