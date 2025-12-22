import { UseApiOptions, UseApiResult, ApiFunction } from '../../types';
import { useApi } from './useApi';

/**
 * Hook for GET requests with caching, polling, and abort support (React 18)
 * @param apiFunction - The API function to execute
 * @param options - Configuration options
 * @returns API result with data, loading, error, refetch, and abort
 */
export function useGet<TData = any, TParams = any>(
  apiFunction: ApiFunction<TData, TParams> | (() => Promise<TData>),
  options: UseApiOptions<TData> = {}
): UseApiResult<TData> {
  return useApi<TData, TParams>(apiFunction, options, 'GET');
}

