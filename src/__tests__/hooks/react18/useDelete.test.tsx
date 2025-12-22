import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDelete } from '../../../hooks/react18/useDelete';

describe('useDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute DELETE request', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDelete(mockApi));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ success: true });
    expect(result.current.error).toBeNull();
  });

  it('should disable cache by default', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    
    const { result: result1 } = renderHook(() => useDelete(mockApi));
    
    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });

    const { result: result2 } = renderHook(() => useDelete(mockApi));
    
    await waitFor(() => {
      expect(result2.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(2); // No cache
  });

  it('should handle errors', async () => {
    const error = new Error('Delete failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useDelete(mockApi));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeNull();
  });

  it('should support refetch', async () => {
    const mockApi = vi.fn()
      .mockResolvedValueOnce({ id: 1, deleted: true })
      .mockResolvedValueOnce({ id: 2, deleted: true });
    
    const { result } = renderHook(() => useDelete(mockApi));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, deleted: true });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 2, deleted: true });
    expect(mockApi).toHaveBeenCalledTimes(2);
  });

  it('should not execute when enabled is false', () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    renderHook(() => useDelete(mockApi, { enabled: false }));

    expect(mockApi).not.toHaveBeenCalled();
  });

  it('should call onSuccess callback', async () => {
    const mockData = { success: true };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();

    renderHook(() => useDelete(mockApi, { onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should call onError callback', async () => {
    const error = new Error('Delete failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    renderHook(() => useDelete(mockApi, { onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should provide abort function', () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDelete(mockApi));

    expect(result.current.abort).toBeDefined();
    expect(typeof result.current.abort).toBe('function');
  });

  it('should handle null response', async () => {
    const mockApi = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useDelete(mockApi));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

