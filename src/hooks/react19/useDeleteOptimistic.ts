import { UseApiOptimisticOptions, UseApiOptimisticResult, ApiFunction } from '../../types';
import { useApiOptimistic } from './useApiOptimistic';

/**
 * Hook for DELETE requests with optimistic updates (React 19)
 * Uses native useOptimistic for instant UI updates
 * 
 * @param apiFunction - The API function to execute
 * @param options - Configuration options with optimistic update function
 * @returns API result with optimistic data and mutate function
 */
export function useDeleteOptimistic<TData = any, TInput = any>(
  apiFunction: ApiFunction<TData, TInput> | ((input: TInput) => Promise<TData>),
  options: UseApiOptimisticOptions<TData, TInput> = {}
): UseApiOptimisticResult<TData, TInput> {
  return useApiOptimistic<TData, TInput>(apiFunction, {
    ...options,
    cache: false,
  });
}

