import { version } from 'react';

/**
 * Parse React version string
 */
function parseVersion(versionString: string): { major: number; minor: number; patch: number } {
  const parts = versionString.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

/**
 * Get the major version of React
 */
export function getReactMajorVersion(): number {
  return parseVersion(version).major;
}

/**
 * Check if React 19 is available
 */
export function isReact19OrLater(): boolean {
  return getReactMajorVersion() >= 19;
}

/**
 * Check if React 18 is available
 */
export function isReact18OrLater(): boolean {
  return getReactMajorVersion() >= 18;
}

/**
 * Safely check if a React 19 hook is available
 */
export function hasReact19Hook(hookName: string): boolean {
  if (!isReact19OrLater()) {
    return false;
  }
  
  try {
    // Check if the hook exists in React
    const React = require('react');
    return typeof React[hookName] === 'function';
  } catch {
    return false;
  }
}

/**
 * Get a React 19 hook safely with fallback
 */
export function getReact19Hook<T>(hookName: string): T | null {
  if (!hasReact19Hook(hookName)) {
    return null;
  }
  
  try {
    const React = require('react');
    return React[hookName] as T;
  } catch {
    return null;
  }
}

