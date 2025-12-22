import { 
  UseApiOptions, 
  UseApiResult, 
  ApiFunction,
  UseSuspenseApiOptions,
  UseSuspenseApiResult,
} from '../../types';
import { useApi, useSuspenseApi } from './useApi';

/**
 * Hook for GET requests with caching, polling, and abort support (React 19)
 * Uses useState pattern with React 19's native cache for deduplication
 * 
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

/**
 * Suspense-based hook for GET requests (React 19)
 * Uses React's `use` hook - must be wrapped in Suspense boundary
 * 
 * @param apiFunction - The API function to execute
 * @param options - Configuration options
 * @returns Resolved data (suspends until ready)
 */
export function useSuspenseGet<TData = any, TParams = any>(
  apiFunction: ApiFunction<TData, TParams> | (() => Promise<TData>),
  options: UseSuspenseApiOptions<TData> = {}
): UseSuspenseApiResult<TData> {
  return useSuspenseApi<TData, TParams>(apiFunction, {
    ...options,
    cache: options.cache ?? true, // Enable cache by default for GET
  });
}

