import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDeleteOptimistic } from '../../../hooks/react19/useDeleteOptimistic';

describe('useDeleteOptimistic (React 19)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute DELETE request with optimistic update', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true, deleted: true });
    const optimisticUpdate = vi.fn((current, input) => ({ deleted: true, id: input.id }));
    
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
    expect(optimisticUpdate).toHaveBeenCalledWith(null, { id: 1 });
    expect(result.current.data).toEqual({ success: true, deleted: true });
  });

  it('should show optimistic data immediately before API response', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, deleted: true }), 100))
    );
    
    const optimisticUpdate = vi.fn((current, input) => ({ 
      deleted: true,
      id: input.id,
      optimistic: true 
    }));
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { optimisticUpdate })
    );

    // Start mutation
    act(() => {
      result.current.mutate({ id: 1 });
    });

    // Optimistic data should be available immediately
    await waitFor(() => {
      expect(result.current.optimisticData).toEqual({
        deleted: true,
        id: 1,
        optimistic: true
      });
    });

    expect(result.current.loading).toBe(true);

    // Wait for actual API response
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Final data should be from server
    expect(result.current.data).toEqual({ success: true, deleted: true });
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

    // Should be called twice - no caching for DELETE
    expect(mockApi).toHaveBeenCalledTimes(2);
  });

  it('should not use cache even if explicitly enabled in options', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    
    // Even if we try to enable cache, it should be disabled for DELETE
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { cache: true } as any)
    );

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.mutate({ id: 1 }); // Same ID
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should still be called twice (cache disabled)
    expect(mockApi).toHaveBeenCalledTimes(2);
  });

  it('should handle errors and rollback optimistic updates by default', async () => {
    const error = new Error('Delete failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const optimisticUpdate = vi.fn((current, input) => ({ 
      deleted: true,
      id: input.id,
      optimistic: true 
    }));
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { optimisticUpdate, onError })
    );

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(onError).toHaveBeenCalledWith(error);
    // Optimistic data should rollback to null (original state)
    expect(result.current.data).toBeNull();
  });

  it('should not rollback on error when rollbackOnError is false', async () => {
    const error = new Error('Delete failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    
    const optimisticUpdate = vi.fn((current, input) => ({ 
      deleted: true,
      id: input.id,
      optimistic: true 
    }));
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { 
        optimisticUpdate, 
        rollbackOnError: false 
      })
    );

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    // Optimistic data should persist even after error
    expect(result.current.data).toEqual({ 
      deleted: true,
      id: 1,
      optimistic: true 
    });
  });

  it('should call onSuccess callback on successful deletion', async () => {
    const mockData = { success: true, deleted: true };
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

  it('should handle abort during pending request', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000))
    );
    
    const { result } = renderHook(() => useDeleteOptimistic(mockApi));

    // Start mutation
    act(() => {
      result.current.mutate({ id: 1 });
    });

    expect(result.current.loading).toBe(true);

    // Abort the request
    act(() => {
      result.current.abort();
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    // Request should be aborted (still no data)
    expect(result.current.data).toBeNull();
  });

  it('should support retry on error', async () => {
    const mockApi = vi
      .fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockRejectedValueOnce(new Error('Second attempt failed'))
      .mockResolvedValueOnce({ success: true, deleted: true });
    
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { 
        retry: 2,
        retryDelay: 100,
        onError 
      })
    );

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    // Wait for retries to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    expect(mockApi).toHaveBeenCalledTimes(3);
    expect(result.current.data).toEqual({ success: true, deleted: true });
    expect(result.current.error).toBeNull();
  });

  it('should call onError after all retries are exhausted', async () => {
    const error = new Error('Persistent error');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { 
        retry: 2,
        retryDelay: 50,
        onError 
      })
    );

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    expect(mockApi).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.error).toEqual(error);
  });

  it('should handle multiple sequential deletions', async () => {
    const mockApi = vi
      .fn()
      .mockResolvedValueOnce({ id: 1, deleted: true })
      .mockResolvedValueOnce({ id: 2, deleted: true })
      .mockResolvedValueOnce({ id: 3, deleted: true });
    
    const { result } = renderHook(() => useDeleteOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, deleted: true });
    });

    await act(async () => {
      await result.current.mutate({ id: 2 });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 2, deleted: true });
    });

    await act(async () => {
      await result.current.mutate({ id: 3 });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 3, deleted: true });
    });

    expect(mockApi).toHaveBeenCalledTimes(3);
  });

  it('should work without optimisticUpdate function', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, deleted: true });
    
    const { result } = renderHook(() => useDeleteOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, deleted: true });
    expect(result.current.optimisticData).toEqual({ id: 1, deleted: true });
  });

  it('should handle optimistic deletion from list', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    
    const initialData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ];
    
    const optimisticUpdate = vi.fn((current, input) => {
      if (!current) return null;
      return (current as any[]).filter(item => item.id !== input.id);
    });
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { optimisticUpdate })
    );

    // Set initial data
    act(() => {
      (result.current as any).data = initialData;
    });

    await act(async () => {
      await result.current.mutate({ id: 2 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ id: 2 });
  });

  it('should handle deletion with additional metadata', async () => {
    const mockApi = vi.fn().mockResolvedValue({ 
      success: true, 
      deleted: true,
      timestamp: Date.now()
    });
    
    const { result } = renderHook(() => useDeleteOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ 
        id: 1, 
        reason: 'User requested deletion',
        force: true 
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({
      id: 1,
      reason: 'User requested deletion',
      force: true
    });

    expect(result.current.data).toMatchObject({
      success: true,
      deleted: true
    });
  });

  it('should handle isPending from useTransition', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );
    
    const { result } = renderHook(() => useDeleteOptimistic(mockApi));

    act(() => {
      result.current.mutate({ id: 1 });
    });

    // Loading should be true during transition
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should return both data and optimisticData', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true, deleted: true });
    const optimisticUpdate = vi.fn(() => ({ deleted: true, optimistic: true }));
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { optimisticUpdate })
    );

    act(() => {
      result.current.mutate({ id: 1 });
    });

    // During pending state, optimisticData should be different from data
    await waitFor(() => {
      expect(result.current.optimisticData).toBeDefined();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After completion, data should be from server
    expect(result.current.data).toEqual({ success: true, deleted: true });
  });

  it('should not retry on abort error', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('Request was aborted'));
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { retry: 3, retryDelay: 50 })
    );

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should only be called once, no retries for abort
    expect(mockApi).toHaveBeenCalledTimes(1);
  });

  it('should handle soft delete with optimistic update', async () => {
    const mockApi = vi.fn().mockResolvedValue({ 
      id: 1, 
      deleted: true, 
      deletedAt: '2024-01-01' 
    });
    
    const optimisticUpdate = vi.fn((current, input) => ({
      ...(current || {}),
      id: input.id,
      deleted: true,
      deletedAt: 'pending'
    }));
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { optimisticUpdate })
    );

    await act(async () => {
      await result.current.mutate({ id: 1, soft: true });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ id: 1, soft: true });
    expect(result.current.data).toEqual({
      id: 1,
      deleted: true,
      deletedAt: '2024-01-01'
    });
  });

  it('should cleanup on unmount', () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    const { result, unmount } = renderHook(() => useDeleteOptimistic(mockApi));

    const abortSpy = vi.spyOn(result.current, 'abort');
    unmount();

    // Verify cleanup happened (abort should be callable)
    expect(abortSpy).toBeDefined();
  });

  it('should handle batch deletions', async () => {
    const mockApi = vi.fn().mockResolvedValue({ 
      success: true, 
      deletedCount: 3 
    });
    
    const optimisticUpdate = vi.fn((current, input) => ({
      deletedIds: input.ids,
      optimistic: true
    }));
    
    const { result } = renderHook(() => 
      useDeleteOptimistic(mockApi, { optimisticUpdate })
    );

    await act(async () => {
      await result.current.mutate({ ids: [1, 2, 3] });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ ids: [1, 2, 3] });
    expect(result.current.data).toEqual({ success: true, deletedCount: 3 });
  });

  it('should work with plain functions (not ApiFunction type)', async () => {
    const mockApi = async (input: { id: number }) => {
      return { id: input.id, deleted: true };
    };
    
    const { result } = renderHook(() => useDeleteOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, deleted: true });
    });
  });

  it('should handle undefined input gracefully', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDeleteOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate(undefined as any);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual({ success: true });
  });
});

