// Export types - always available
export type {
  RequestConfig,
  CacheConfig,
  CacheStrategy,
  UseApiOptions,
  UseApiResult,
  ApiFunction,
  GeneratorConfig,
  OptimisticUpdateFn,
  UseApiOptimisticOptions,
  UseApiOptimisticResult,
  UseApiActionOptions,
  UseApiActionResult,
  // React 19 Suspense types
  UseSuspenseApiOptions,
  UseSuspenseApiResult,
  UseSuspenseGetOptions,
  UseSuspenseGetResult,
} from './types';

// Export React version utilities - always available
export { 
  getReactMajorVersion, 
  isReact19OrLater, 
  isReact18OrLater 
} from './utils/react-version';

// Export core utilities - always available
export { createCache } from './core/cache';
export { makeRequest } from './core/request';

// Re-export React 18 compatible hooks as default exports
// These work with React 17, 18, and 19
export * from './hooks/react18';

// NOTE: React 19 specific features (useSuspenseApi, useSuspenseGet, createCachedFetch, etc.)
// are NOT exported from the main entry point to maintain React 18 compatibility.
// 
// To use React 19 features, import from the /react19 subpath:
//   import { useSuspenseGet, createCachedFetch } from 'react-api-weaver/react19';
//
// This ensures users on React 18 won't get import errors from React 19-only APIs.
