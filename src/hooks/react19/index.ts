// React 19 hooks - Uses native React 19 features (use, cache, useOptimistic, useActionState)

// Standard API hooks
export { useGet, useSuspenseGet } from './useGet';
export { usePost } from './usePost';
export { usePut } from './usePut';
export { usePatch } from './usePatch';
export { useDelete } from './useDelete';

// Base hooks
export { useApi, useSuspenseApi } from './useApi';

// Action hook for form submissions (uses useActionState)
export { useApiAction } from './useApiAction';

// Optimistic update hooks (uses useOptimistic)
export { useApiOptimistic } from './useApiOptimistic';
export { usePostOptimistic } from './usePostOptimistic';
export { usePutOptimistic } from './usePutOptimistic';
export { usePatchOptimistic } from './usePatchOptimistic';
export { useDeleteOptimistic } from './useDeleteOptimistic';

// Cache utilities (uses native cache + CacheManager hybrid)
export {
  createCachedFetch,
  invalidateCache,
  clearCache,
  getCacheSize,
} from './cache';

