/**
 * Configuration options for API requests
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  baseURL?: string;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
}

/**
 * Cache strategy for hybrid caching (React 19)
 */
export interface CacheStrategy extends CacheConfig {
  /**
   * Enable React 19's native cache for automatic request deduplication
   * Default: true
   */
  useNativeCache?: boolean;
  /**
   * Enable TTL-based caching via CacheManager
   * Default: true
   */
  useTtlCache?: boolean;
}

/**
 * Options for API hooks
 */
export interface UseApiOptions<TData = any> {
  cache?: boolean | CacheConfig;
  polling?: number; // Polling interval in milliseconds
  enabled?: boolean; // Whether the request should be executed
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  retry?: number | boolean; // Number of retries or boolean
  retryDelay?: number; // Delay between retries in ms
}

/**
 * Return type for API hooks
 */
export interface UseApiResult<TData = any, TError = Error> {
  data: TData | null;
  loading: boolean;
  error: TError | null;
  refetch: () => Promise<void>;
  abort: () => void;
}

/**
 * API function type that can be passed to hooks
 */
export type ApiFunction<TData = any, TParams = any> = (
  params?: TParams,
  config?: RequestConfig
) => Promise<TData>;

/**
 * Generator configuration options
 */
export interface GeneratorConfig {
  input: string; // Path to OpenAPI YAML file
  output: string; // Output directory
  format: 'ts' | 'js' | 'both'; // Output format
  baseURL?: string; // Base URL for API requests
}

/**
 * Function to compute optimistic state update
 */
export type OptimisticUpdateFn<TData, TInput = any> = (
  currentData: TData | null,
  input: TInput
) => TData;

/**
 * Options for useApiOptimistic hook
 */
export interface UseApiOptimisticOptions<TData = any, TInput = any> extends Omit<UseApiOptions<TData>, 'enabled'> {
  optimisticUpdate?: OptimisticUpdateFn<TData, TInput>;
  rollbackOnError?: boolean; // Default: true
}

/**
 * Return type for useApiOptimistic hook
 */
export interface UseApiOptimisticResult<TData = any, TInput = any> {
  data: TData | null;
  optimisticData: TData | null; // The optimistic state
  loading: boolean;
  error: Error | null;
  mutate: (input: TInput) => Promise<void>;
  abort: () => void;
}

/**
 * Options for useApiAction hook
 */
export interface UseApiActionOptions<TData = any> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  initialData?: TData | null;
}

/**
 * Return type for useApiAction hook
 */
export interface UseApiActionResult<TData = any, TInput = any> {
  data: TData | null;
  error: Error | null;
  isPending: boolean;
  action: (input: TInput) => Promise<void>;
  formAction: (formData: FormData) => Promise<void>;
}

// ============================================
// React 19 Suspense-specific types
// ============================================

/**
 * Options for Suspense-based API hooks (React 19)
 * Used with useSuspenseApi, useSuspenseGet, etc.
 */
export interface UseSuspenseApiOptions<TData = any> {
  cache?: boolean | CacheConfig | CacheStrategy;
  enabled?: boolean; // Whether the request should be executed
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

/**
 * Return type for Suspense-based API hooks (React 19)
 * Note: No loading or error state - handled by Suspense and ErrorBoundary
 */
export interface UseSuspenseApiResult<TData = any> {
  data: TData;
  refetch: () => Promise<void>;
  abort: () => void;
}

/**
 * Options for useSuspenseGet hook (React 19)
 */
export interface UseSuspenseGetOptions<TData = any> extends UseSuspenseApiOptions<TData> {
  // GET-specific options can be added here
}

/**
 * Return type for useSuspenseGet hook (React 19)
 */
export interface UseSuspenseGetResult<TData = any> extends UseSuspenseApiResult<TData> {
  // GET-specific result properties can be added here
}
