import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePatch } from '../../hooks/usePatch';

describe('usePatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute PATCH request', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, patched: true });
    const { result } = renderHook(() => usePatch(mockApi));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ id: 1, patched: true });
    expect(result.current.error).toBeNull();
  });

  it('should disable cache by default', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, patched: true });
    
    const { result: result1 } = renderHook(() => usePatch(mockApi));
    
    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });

    const { result: result2 } = renderHook(() => usePatch(mockApi));
    
    await waitFor(() => {
      expect(result2.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(2); // No cache
  });

  it('should handle errors', async () => {
    const error = new Error('Patch failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => usePatch(mockApi));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeNull();
  });

  it('should support refetch', async () => {
    const mockApi = vi.fn()
      .mockResolvedValueOnce({ id: 1, value: 'first' })
      .mockResolvedValueOnce({ id: 1, value: 'second' });
    
    const { result } = renderHook(() => usePatch(mockApi));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, value: 'first' });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, value: 'second' });
    expect(mockApi).toHaveBeenCalledTimes(2);
  });

  it('should not execute when enabled is false', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    renderHook(() => usePatch(mockApi, { enabled: false }));

    expect(mockApi).not.toHaveBeenCalled();
  });

  it('should call onSuccess callback', async () => {
    const mockData = { id: 1, patched: true };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();

    renderHook(() => usePatch(mockApi, { onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should call onError callback', async () => {
    const error = new Error('Patch failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    renderHook(() => usePatch(mockApi, { onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should provide abort function', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => usePatch(mockApi));

    expect(result.current.abort).toBeDefined();
    expect(typeof result.current.abort).toBe('function');
  });
});

