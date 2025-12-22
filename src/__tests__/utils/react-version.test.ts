import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getReactMajorVersion,
  isReact19OrLater,
  isReact18OrLater,
  hasReact19Hook,
  getReact19Hook,
} from '../../utils/react-version';

// Mock React module
vi.mock('react', () => ({
  version: '19.0.0',
  useActionState: vi.fn(),
  useOptimistic: vi.fn(),
}));

describe('React Version Utilities', () => {
  describe('getReactMajorVersion', () => {
    it('should return the major version of React', () => {
      const majorVersion = getReactMajorVersion();
      expect(majorVersion).toBe(19);
      expect(typeof majorVersion).toBe('number');
    });

    it('should handle React 18 version', async () => {
      // Re-mock for React 18
      vi.doMock('react', () => ({
        version: '18.2.0',
      }));
      
      // Clear cache and re-import
      vi.resetModules();
      const { getReactMajorVersion: getVersion18 } = await import('../../utils/react-version');
      expect(getVersion18()).toBe(18);
      
      // Restore original mock
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle React 17 version', async () => {
      // Re-mock for React 17
      vi.doMock('react', () => ({
        version: '17.0.2',
      }));
      
      vi.resetModules();
      const { getReactMajorVersion: getVersion17 } = await import('../../utils/react-version');
      expect(getVersion17()).toBe(17);
      
      // Restore original mock
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle version with only major number', async () => {
      vi.doMock('react', () => ({
        version: '20',
      }));
      
      vi.resetModules();
      const { getReactMajorVersion: getVersion20 } = await import('../../utils/react-version');
      expect(getVersion20()).toBe(20);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle pre-release versions', async () => {
      vi.doMock('react', () => ({
        version: '19.0.0-rc.1',
      }));
      
      vi.resetModules();
      const { getReactMajorVersion: getVersionRc } = await import('../../utils/react-version');
      expect(getVersionRc()).toBe(19);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });
  });

  describe('isReact19OrLater', () => {
    it('should return true for React 19', () => {
      expect(isReact19OrLater()).toBe(true);
    });

    it('should return true for React versions >= 19', async () => {
      vi.doMock('react', () => ({
        version: '20.0.0',
      }));
      
      vi.resetModules();
      const { isReact19OrLater: isReact19Check } = await import('../../utils/react-version');
      expect(isReact19Check()).toBe(true);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should return false for React 18', async () => {
      vi.doMock('react', () => ({
        version: '18.2.0',
      }));
      
      vi.resetModules();
      const { isReact19OrLater: isReact19Check } = await import('../../utils/react-version');
      expect(isReact19Check()).toBe(false);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should return false for React 17', async () => {
      vi.doMock('react', () => ({
        version: '17.0.2',
      }));
      
      vi.resetModules();
      const { isReact19OrLater: isReact19Check } = await import('../../utils/react-version');
      expect(isReact19Check()).toBe(false);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });
  });

  describe('isReact18OrLater', () => {
    it('should return true for React 19', () => {
      expect(isReact18OrLater()).toBe(true);
    });

    it('should return true for React 18', async () => {
      vi.doMock('react', () => ({
        version: '18.2.0',
      }));
      
      vi.resetModules();
      const { isReact18OrLater: isReact18Check } = await import('../../utils/react-version');
      expect(isReact18Check()).toBe(true);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should return false for React 17', async () => {
      vi.doMock('react', () => ({
        version: '17.0.2',
      }));
      
      vi.resetModules();
      const { isReact18OrLater: isReact18Check } = await import('../../utils/react-version');
      expect(isReact18Check()).toBe(false);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should return true for React versions >= 20', async () => {
      vi.doMock('react', () => ({
        version: '20.0.0',
      }));
      
      vi.resetModules();
      const { isReact18OrLater: isReact18Check } = await import('../../utils/react-version');
      expect(isReact18Check()).toBe(true);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });
  });

  describe('hasReact19Hook', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should return true for existing React 19 hooks', () => {
      const hasUseActionState = hasReact19Hook('useActionState');
      expect(hasUseActionState).toBe(true);
    });

    it('should return true for useOptimistic hook', () => {
      const hasUseOptimistic = hasReact19Hook('useOptimistic');
      expect(hasUseOptimistic).toBe(true);
    });

    it('should return false for non-existent hooks', () => {
      const hasNonExistent = hasReact19Hook('useNonExistentHook');
      expect(hasNonExistent).toBe(false);
    });

    it('should return false for non-function exports', () => {
      const hasVersion = hasReact19Hook('version');
      expect(hasVersion).toBe(false);
    });

    it('should return false when React version is less than 19', async () => {
      vi.doMock('react', () => ({
        version: '18.2.0',
        useState: vi.fn(),
      }));
      
      vi.resetModules();
      const { hasReact19Hook: hasHook18 } = await import('../../utils/react-version');
      expect(hasHook18('useActionState')).toBe(false);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle errors gracefully', () => {
      // Test with empty string
      const result = hasReact19Hook('');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getReact19Hook', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should return the hook function when it exists', () => {
      const useActionState = getReact19Hook('useActionState');
      expect(useActionState).not.toBeNull();
      expect(typeof useActionState).toBe('function');
    });

    it('should return the useOptimistic hook', () => {
      const useOptimistic = getReact19Hook('useOptimistic');
      expect(useOptimistic).not.toBeNull();
      expect(typeof useOptimistic).toBe('function');
    });

    it('should return null for non-existent hooks', () => {
      const nonExistent = getReact19Hook('useNonExistentHook');
      expect(nonExistent).toBeNull();
    });

    it('should return null when React version is less than 19', async () => {
      vi.doMock('react', () => ({
        version: '18.2.0',
        useState: vi.fn(),
      }));
      
      vi.resetModules();
      const { getReact19Hook: getHook18 } = await import('../../utils/react-version');
      expect(getHook18('useActionState')).toBeNull();
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should return null for non-function exports', () => {
      const version = getReact19Hook('version');
      expect(version).toBeNull();
    });

    it('should handle type parameter correctly', () => {
      type UseActionStateFn = () => void;
      const hook = getReact19Hook<UseActionStateFn>('useActionState');
      expect(hook).not.toBeNull();
      if (hook) {
        expect(typeof hook).toBe('function');
      }
    });

    it('should handle errors gracefully', () => {
      const result = getReact19Hook('');
      expect(result).toBeNull();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle malformed version strings', async () => {
      vi.doMock('react', () => ({
        version: 'invalid.version.string',
      }));
      
      vi.resetModules();
      const { getReactMajorVersion: getVersionInvalid } = await import('../../utils/react-version');
      const version = getVersionInvalid();
      expect(typeof version).toBe('number');
      // NaN || 0 returns 0, so malformed versions default to 0
      expect(version).toBe(0);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle empty version string', async () => {
      vi.doMock('react', () => ({
        version: '',
      }));
      
      vi.resetModules();
      const { getReactMajorVersion: getVersionEmpty } = await import('../../utils/react-version');
      expect(getVersionEmpty()).toBe(0);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle version with extra parts', async () => {
      vi.doMock('react', () => ({
        version: '19.0.0.extra.parts',
      }));
      
      vi.resetModules();
      const { getReactMajorVersion: getVersionExtra } = await import('../../utils/react-version');
      expect(getVersionExtra()).toBe(19);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle beta versions', async () => {
      vi.doMock('react', () => ({
        version: '19.0.0-beta.1',
      }));
      
      vi.resetModules();
      const { getReactMajorVersion: getVersionBeta } = await import('../../utils/react-version');
      expect(getVersionBeta()).toBe(19);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle alpha versions', async () => {
      vi.doMock('react', () => ({
        version: '19.0.0-alpha.2',
      }));
      
      vi.resetModules();
      const { getReactMajorVersion: getVersionAlpha } = await import('../../utils/react-version');
      expect(getVersionAlpha()).toBe(19);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle canary versions', async () => {
      vi.doMock('react', () => ({
        version: '0.0.0-experimental-abc123',
      }));
      
      vi.resetModules();
      const { getReactMajorVersion: getVersionCanary } = await import('../../utils/react-version');
      expect(getVersionCanary()).toBe(0);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle version with build metadata', async () => {
      vi.doMock('react', () => ({
        version: '19.0.0+20231201',
      }));
      
      vi.resetModules();
      const { getReactMajorVersion: getVersionBuild } = await import('../../utils/react-version');
      expect(getVersionBuild()).toBe(19);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });
  });

  describe('Version boundary tests', () => {
    it('should handle React 16 version', async () => {
      vi.doMock('react', () => ({
        version: '16.14.0',
      }));
      
      vi.resetModules();
      const { 
        getReactMajorVersion, 
        isReact18OrLater, 
        isReact19OrLater 
      } = await import('../../utils/react-version');
      
      expect(getReactMajorVersion()).toBe(16);
      expect(isReact18OrLater()).toBe(false);
      expect(isReact19OrLater()).toBe(false);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle exact boundary version 18.0.0', async () => {
      vi.doMock('react', () => ({
        version: '18.0.0',
      }));
      
      vi.resetModules();
      const { isReact18OrLater, isReact19OrLater } = await import('../../utils/react-version');
      expect(isReact18OrLater()).toBe(true);
      expect(isReact19OrLater()).toBe(false);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle exact boundary version 19.0.0', async () => {
      vi.doMock('react', () => ({
        version: '19.0.0',
      }));
      
      vi.resetModules();
      const { isReact18OrLater, isReact19OrLater } = await import('../../utils/react-version');
      expect(isReact18OrLater()).toBe(true);
      expect(isReact19OrLater()).toBe(true);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle version 17.0.0 (just below 18)', async () => {
      vi.doMock('react', () => ({
        version: '17.0.0',
      }));
      
      vi.resetModules();
      const { isReact18OrLater } = await import('../../utils/react-version');
      expect(isReact18OrLater()).toBe(false);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle version 18.99.99', async () => {
      vi.doMock('react', () => ({
        version: '18.99.99',
      }));
      
      vi.resetModules();
      const { isReact18OrLater, isReact19OrLater } = await import('../../utils/react-version');
      expect(isReact18OrLater()).toBe(true);
      expect(isReact19OrLater()).toBe(false);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });

    it('should handle very high version numbers', async () => {
      vi.doMock('react', () => ({
        version: '100.0.0',
      }));
      
      vi.resetModules();
      const { 
        getReactMajorVersion,
        isReact18OrLater, 
        isReact19OrLater 
      } = await import('../../utils/react-version');
      
      expect(getReactMajorVersion()).toBe(100);
      expect(isReact18OrLater()).toBe(true);
      expect(isReact19OrLater()).toBe(true);
      
      // Restore
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
      }));
      vi.resetModules();
    });
  });

  describe('Multiple hook checks', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should handle checking multiple hooks in succession', () => {
      const hooks = ['useActionState', 'useOptimistic', 'useNonExistent1', 'useNonExistent2'];
      const results = hooks.map(hook => hasReact19Hook(hook));
      
      expect(results[0]).toBe(true); // useActionState exists
      expect(results[1]).toBe(true); // useOptimistic exists
      expect(results[2]).toBe(false); // useNonExistent1 doesn't exist
      expect(results[3]).toBe(false); // useNonExistent2 doesn't exist
    });

    it('should handle getting multiple hooks in succession', () => {
      const useActionState = getReact19Hook('useActionState');
      const useOptimistic = getReact19Hook('useOptimistic');
      const nonExistent = getReact19Hook('useNonExistent');
      
      expect(useActionState).not.toBeNull();
      expect(useOptimistic).not.toBeNull();
      expect(nonExistent).toBeNull();
    });

    it('should consistently return same results for same hook', () => {
      const result1 = hasReact19Hook('useActionState');
      const result2 = hasReact19Hook('useActionState');
      const result3 = hasReact19Hook('useActionState');
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('Special hook names', () => {
    it('should handle hook names with special characters', () => {
      const result = hasReact19Hook('use@Hook');
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });

    it('should handle hook names with numbers', () => {
      const result = hasReact19Hook('useHook123');
      expect(typeof result).toBe('boolean');
    });

    it('should handle very long hook names', () => {
      const longName = 'use' + 'A'.repeat(1000);
      const result = hasReact19Hook(longName);
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });

    it('should handle hook names with spaces', () => {
      const result = hasReact19Hook('use Hook');
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });

    it('should handle hook names with unicode characters', () => {
      const result = hasReact19Hook('use🚀Hook');
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });

  describe('Consistency and caching', () => {
    it('should return consistent results across multiple calls', () => {
      const results = Array.from({ length: 10 }, () => getReactMajorVersion());
      const allSame = results.every(r => r === results[0]);
      expect(allSame).toBe(true);
    });

    it('should return consistent boolean results', () => {
      const results18 = Array.from({ length: 5 }, () => isReact18OrLater());
      const results19 = Array.from({ length: 5 }, () => isReact19OrLater());
      
      expect(results18.every(r => r === results18[0])).toBe(true);
      expect(results19.every(r => r === results19[0])).toBe(true);
    });
  });

  describe('Type safety and return types', () => {
    it('should always return a number from getReactMajorVersion', () => {
      const version = getReactMajorVersion();
      expect(typeof version).toBe('number');
      expect(Number.isFinite(version) || version === 0).toBe(true);
    });

    it('should always return boolean from isReact19OrLater', () => {
      const result = isReact19OrLater();
      expect(typeof result).toBe('boolean');
    });

    it('should always return boolean from isReact18OrLater', () => {
      const result = isReact18OrLater();
      expect(typeof result).toBe('boolean');
    });

    it('should always return boolean from hasReact19Hook', () => {
      const result = hasReact19Hook('anyHook');
      expect(typeof result).toBe('boolean');
    });

    it('should return function or null from getReact19Hook', () => {
      const hook = getReact19Hook('useActionState');
      expect(hook === null || typeof hook === 'function').toBe(true);
    });
  });

  describe('Additional React 19 hook scenarios', () => {
    it('should detect multiple React 19 hooks with mocked module', () => {
      vi.doMock('react', () => ({
        version: '19.0.0',
        useActionState: vi.fn(),
        useOptimistic: vi.fn(),
        use: vi.fn(),
        useFormStatus: vi.fn(),
        useFormState: vi.fn(),
      }));
      
      vi.resetModules();
    });

    it('should validate hook exists and is a function', () => {
      // When checking for hooks, both existence and function type are verified
      const validHook = hasReact19Hook('useActionState');
      const invalidHook = hasReact19Hook('someRandomProperty');
      
      expect(validHook).toBe(true);
      expect(invalidHook).toBe(false);
    });

    it('should return null when getting non-function property as hook', () => {
      // version is a string property, not a function
      const notAHook = getReact19Hook('version');
      expect(notAHook).toBeNull();
    });

    it('should properly type-check hooks before returning them', () => {
      // Test that only function types are returned as valid hooks
      const hook1 = getReact19Hook('useActionState');
      const hook2 = getReact19Hook('useOptimistic');
      
      expect(typeof hook1).toBe('function');
      expect(typeof hook2).toBe('function');
    });
  });
});

