// Export types
export type {
  RequestConfig,
  CacheConfig,
  UseApiOptions,
  UseApiResult,
  ApiFunction,
  GeneratorConfig,
  // React 19+ types
  OptimisticUpdateFn,
  UseApiOptimisticOptions,
  UseApiOptimisticResult,
  UseApiActionOptions,
  UseApiActionResult,
} from './types';

// Export standard hooks
export { useGet } from './hooks/useGet';
export { usePost } from './hooks/usePost';
export { usePut } from './hooks/usePut';
export { usePatch } from './hooks/usePatch';
export { useDelete } from './hooks/useDelete';

// Export React 19+ hooks (with backward compatibility)
export { useApiOptimistic } from './hooks/useApiOptimistic';
export { useApiAction } from './hooks/useApiAction';
export { usePostOptimistic } from './hooks/usePostOptimistic';
export { usePutOptimistic } from './hooks/usePutOptimistic';
export { usePatchOptimistic } from './hooks/usePatchOptimistic';
export { useDeleteOptimistic } from './hooks/useDeleteOptimistic';

// Export core utilities
export { createCache } from './core/cache';
export { makeRequest } from './core/request';

// Export React version utilities
export { 
  getReactMajorVersion, 
  isReact19OrLater, 
  isReact18OrLater 
} from './utils/react-version';

