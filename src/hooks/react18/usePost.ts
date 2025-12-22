import { UseApiOptions, UseApiResult, ApiFunction } from '../../types';
import { useApi } from './useApi';

/**
 * Hook for POST requests (React 18)
 * @param apiFunction - The API function to execute
 * @param options - Configuration options (cache disabled by default)
 * @returns API result with data, loading, error, refetch, and abort
 */
export function usePost<TData = any, TParams = any>(
  apiFunction: ApiFunction<TData, TParams> | (() => Promise<TData>),
  options: UseApiOptions<TData> = {}
): UseApiResult<TData> {
  return useApi<TData, TParams>(
    apiFunction,
    { ...options, cache: false },
    'POST'
  );
}

