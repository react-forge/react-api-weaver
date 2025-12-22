import { cache } from 'react';
import { createCache, generateCacheKey, CacheManager } from '../../core/cache';
import { CacheConfig } from '../../types';

// Custom cache manager for TTL-based invalidation
const cacheManagerInstance: CacheManager = createCache();

/**
 * Hybrid cache configuration for React 19
 * Combines React's native cache (for request deduplication during render)
 * with custom CacheManager (for TTL-based cache persistence)
 */
export interface HybridCacheConfig extends CacheConfig {
  /**
   * Enable React's native cache for automatic request deduplication
   * Default: true
   */
  useNativeCache?: boolean;
}

/**
 * Create a cached API function that combines:
 * 1. React 19's native `cache` for automatic request deduplication during render
 * 2. Custom CacheManager for TTL-based cache persistence across renders
 * 
 * @param apiFunction - The API function to cache
 * @param config - Cache configuration
 * @returns Cached API function with deduplication and TTL support
 */
export function createCachedFetch<TData, TParams = void>(
  apiFunction: (params?: TParams) => Promise<TData>,
  config: HybridCacheConfig = {}
): (params?: TParams) => Promise<TData> {
  const {
    ttl = 300000, // 5 minutes default
    key: customKey,
    useNativeCache = true,
  } = config;

  // Wrap with React's native cache for request deduplication
  const dedupedFetch = useNativeCache
    ? cache(async (params?: TParams): Promise<TData> => {
        const cacheKey = generateCacheKey(
          apiFunction.name || 'api',
          params,
          customKey
        );

        // Check TTL-based cache first
        const cachedData = cacheManagerInstance.get<TData>(cacheKey);
        if (cachedData !== null) {
          return cachedData;
        }

        // Execute the API call
        const result = await apiFunction(params);

        // Store in TTL-based cache
        cacheManagerInstance.set(cacheKey, result, ttl);

        return result;
      })
    : async (params?: TParams): Promise<TData> => {
        const cacheKey = generateCacheKey(
          apiFunction.name || 'api',
          params,
          customKey
        );

        // Check TTL-based cache first
        const cachedData = cacheManagerInstance.get<TData>(cacheKey);
        if (cachedData !== null) {
          return cachedData;
        }

        // Execute the API call
        const result = await apiFunction(params);

        // Store in TTL-based cache
        cacheManagerInstance.set(cacheKey, result, ttl);

        return result;
      };

  return dedupedFetch;
}

/**
 * Invalidate cache for a specific key or pattern
 * @param key - Cache key to invalidate
 */
export function invalidateCache(key: string): void {
  cacheManagerInstance.delete(key);
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cacheManagerInstance.clear();
}

/**
 * Get the current cache size
 */
export function getCacheSize(): number {
  return cacheManagerInstance.size();
}

// Re-export utilities for use in hooks
export { cacheManagerInstance as cacheManager, generateCacheKey };
