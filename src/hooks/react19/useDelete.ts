import { UseApiOptions, UseApiResult, ApiFunction } from '../../types';
import { useApi } from './useApi';

/**
 * Hook for DELETE requests (React 19)
 * Uses React 19's useTransition for better concurrent rendering
 * 
 * @param apiFunction - The API function to execute
 * @param options - Configuration options (cache disabled by default)
 * @returns API result with data, loading, error, refetch, and abort
 */
export function useDelete<TData = any, TParams = any>(
  apiFunction: ApiFunction<TData, TParams> | (() => Promise<TData>),
  options: UseApiOptions<TData> = {}
): UseApiResult<TData> {
  return useApi<TData, TParams>(
    apiFunction,
    { ...options, cache: false },
    'DELETE'
  );
}

