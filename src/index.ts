// Export types
export type {
  RequestConfig,
  CacheConfig,
  UseApiOptions,
  UseApiResult,
  ApiFunction,
  GeneratorConfig,
} from './types';

// Export hooks (will be implemented next)
export { useGet } from './hooks/useGet';
export { usePost } from './hooks/usePost';
export { usePut } from './hooks/usePut';
export { usePatch } from './hooks/usePatch';
export { useDelete } from './hooks/useDelete';

// Export core utilities
export { createCache } from './core/cache';
export { makeRequest } from './core/request';

