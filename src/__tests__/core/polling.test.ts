import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPollingManager } from '../../core/polling';

describe('Polling Manager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a polling manager with start and stop methods', () => {
    const manager = createPollingManager();
    expect(manager.start).toBeDefined();
    expect(manager.stop).toBeDefined();
  });

  it('should call callback at specified interval', () => {
    const manager = createPollingManager();
    const callback = vi.fn();
    
    manager.start(callback, 1000);
    
    // Initially no calls
    expect(callback).not.toHaveBeenCalled();
    
    // After 1 second
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    
    // After 2 seconds
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);
    
    manager.stop();
  });

  it('should stop polling when stop is called', () => {
    const manager = createPollingManager();
    const callback = vi.fn();
    
    manager.start(callback, 1000);
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    
    manager.stop();
    vi.advanceTimersByTime(1000);
    // Should not call again after stop
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple start/stop cycles', () => {
    const manager = createPollingManager();
    const callback = vi.fn();
    
    manager.start(callback, 1000);
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    
    manager.stop();
    manager.start(callback, 1000);
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);
    
    manager.stop();
  });

  it('should support changing polling interval', () => {
    const manager = createPollingManager();
    const callback = vi.fn();
    
    manager.start(callback, 1000);
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    
    manager.stop();
    manager.start(callback, 500);
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(2);
    
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(3);
    
    manager.stop();
  });

  it('should not start if already started', () => {
    const manager = createPollingManager();
    const callback = vi.fn();
    
    manager.start(callback, 1000);
    manager.start(callback, 1000); // Second start should be ignored
    
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    
    manager.stop();
  });
});

