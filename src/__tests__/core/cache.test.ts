import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCache, generateCacheKey } from '../../core/cache';

describe('Cache Utilities', () => {
  let cache: ReturnType<typeof createCache>;

  beforeEach(() => {
    cache = createCache();
  });

  describe('createCache', () => {
    it('should create a cache instance with get, set, clear, and has methods', () => {
      expect(cache.get).toBeDefined();
      expect(cache.set).toBeDefined();
      expect(cache.clear).toBeDefined();
      expect(cache.has).toBeDefined();
    });

    it('should store and retrieve values', () => {
      cache.set('key1', { data: 'test' });
      const result = cache.get('key1');
      expect(result).toEqual({ data: 'test' });
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should expire cache entries after TTL', async () => {
      cache.set('key1', { data: 'test' }, 100); // 100ms TTL
      expect(cache.get('key1')).toEqual({ data: 'test' });
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.get('key1')).toBeNull();
    });

    it('should check if a key exists', () => {
      cache.set('key1', { data: 'test' });
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should clear all cache entries', () => {
      cache.set('key1', { data: 'test1' });
      cache.set('key2', { data: 'test2' });
      cache.clear();
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent cache keys for same inputs', () => {
      const key1 = generateCacheKey('api', { id: 1 });
      const key2 = generateCacheKey('api', { id: 1 });
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different inputs', () => {
      const key1 = generateCacheKey('api', { id: 1 });
      const key2 = generateCacheKey('api', { id: 2 });
      expect(key1).not.toBe(key2);
    });

    it('should use custom cache key when provided', () => {
      const customKey = 'custom-key';
      const key = generateCacheKey('api', { id: 1 }, customKey);
      expect(key).toBe(customKey);
    });
  });
});

