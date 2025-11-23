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

