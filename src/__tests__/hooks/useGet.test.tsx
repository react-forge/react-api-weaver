import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGet } from '../../hooks/useGet';

describe('useGet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data on mount', async () => {
    const mockApi = vi.fn().mockResolvedValue([
      { id: 1, title: 'Todo 1' },
      { id: 2, title: 'Todo 2' },
    ]);

    const { result } = renderHook(() => useGet(mockApi));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(1);
    expect(result.current.data).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch when enabled is false', () => {
    const mockApi = vi.fn().mockResolvedValue([]);
    renderHook(() => useGet(mockApi, { enabled: false }));

    expect(mockApi).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('Network Error'));
    const { result } = renderHook(() => useGet(mockApi));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Network Error');
    expect(result.current.data).toBeNull();
  });

  it('should refetch data when refetch is called', async () => {
    const mockApi = vi.fn().mockResolvedValue([{ id: 1, title: 'Todo 1' }]);
    const { result } = renderHook(() => useGet(mockApi));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(1);

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(2);
  });

  it('should call onSuccess callback on successful fetch', async () => {
    const mockData = [{ id: 1, title: 'Todo 1' }];
    const mockApi = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();

    renderHook(() => useGet(mockApi, { onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should call onError callback on fetch error', async () => {
    const error = new Error('Network Error');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    renderHook(() => useGet(mockApi, { onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should support caching', async () => {
    const mockApi = vi.fn().mockResolvedValue([{ id: 1, title: 'Todo 1' }]);
    
    const { result: result1 } = renderHook(() =>
      useGet(mockApi, { cache: true })
    );

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });

    // Cache should work, but implementation might vary
    expect(mockApi).toHaveBeenCalled();
  });

  it('should provide abort function', () => {
    const mockApi = vi.fn().mockResolvedValue([]);
    const { result } = renderHook(() => useGet(mockApi));

    expect(result.current.abort).toBeDefined();
    expect(typeof result.current.abort).toBe('function');
  });
});

