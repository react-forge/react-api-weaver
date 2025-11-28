import { describe, it, expect } from 'vitest';
import {
  getReactMajorVersion,
  isReact19OrLater,
  isReact18OrLater,
  hasReact19Hook,
} from '../../utils/react-version';

describe('React Version Utilities', () => {
  describe('getReactMajorVersion', () => {
    it('should return a valid major version number', () => {
      const version = getReactMajorVersion();
      expect(version).toBeGreaterThanOrEqual(17);
      expect(Number.isInteger(version)).toBe(true);
    });
  });

  describe('isReact19OrLater', () => {
    it('should return a boolean', () => {
      const result = isReact19OrLater();
      expect(typeof result).toBe('boolean');
    });

    it('should return true for React 19+', () => {
      const version = getReactMajorVersion();
      const result = isReact19OrLater();
      expect(result).toBe(version >= 19);
    });
  });

  describe('isReact18OrLater', () => {
    it('should return a boolean', () => {
      const result = isReact18OrLater();
      expect(typeof result).toBe('boolean');
    });

    it('should return true for React 18+', () => {
      const version = getReactMajorVersion();
      const result = isReact18OrLater();
      expect(result).toBe(version >= 18);
    });
  });

  describe('hasReact19Hook', () => {
    it('should return false for non-existent hooks', () => {
      const result = hasReact19Hook('useNonExistentHook');
      expect(result).toBe(false);
    });

    it('should return boolean for valid hook names', () => {
      const result = hasReact19Hook('useState');
      expect(typeof result).toBe('boolean');
    });
  });
});

