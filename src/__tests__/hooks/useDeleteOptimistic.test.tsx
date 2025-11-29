import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDeleteOptimistic } from '../../hooks/useDeleteOptimistic';

describe('useDeleteOptimistic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute DELETE request with optimistic update', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    const optimisticUpdate = vi.fn((current, input) => ({ deleted: true, ...input }));
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { optimisticUpdate })
    );

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ id: 1 });
    expect(result.current.data).toEqual({ success: true });
  });

  it('should disable cache by default', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => useDeleteOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.mutate({ id: 2 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(2); // No cache
  });

  it('should handle errors', async () => {
    const error = new Error('Delete failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { onError })
    );

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should call onSuccess callback', async () => {
    const mockData = { success: true };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { onSuccess })
    );

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should provide abort function', () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDeleteOptimistic(mockApi));

    expect(result.current.abort).toBeDefined();
    expect(typeof result.current.abort).toBe('function');
  });

  it('should not execute on mount', () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    renderHook(() => useDeleteOptimistic(mockApi));

    expect(mockApi).not.toHaveBeenCalled();
  });
});

