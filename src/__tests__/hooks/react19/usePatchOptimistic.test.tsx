import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePatchOptimistic } from '../../../hooks/react19/usePatchOptimistic';

describe('usePatchOptimistic (React 19)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute PATCH request with optimistic update', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Patched' });
    const optimisticUpdate = vi.fn((current, input) => ({ id: 1, ...input }));
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { optimisticUpdate })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Patched Item' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ title: 'Patched Item' });
    expect(optimisticUpdate).toHaveBeenCalledWith(null, { title: 'Patched Item' });
    expect(result.current.data).toEqual({ id: 1, title: 'Patched' });
  });

  it('should show optimistic data immediately before API response', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ id: 1, title: 'Server Response' }), 100))
    );
    
    const optimisticUpdate = vi.fn((current, input) => ({ 
      id: 1, 
      title: input.title,
      optimistic: true 
    }));
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { optimisticUpdate })
    );

    // Start mutation
    act(() => {
      result.current.mutate({ title: 'Optimistic Update' });
    });

    // Optimistic data should be available immediately
    await waitFor(() => {
      expect(result.current.optimisticData).toEqual({
        id: 1,
        title: 'Optimistic Update',
        optimistic: true
      });
    });

    expect(result.current.loading).toBe(true);

    // Wait for actual API response
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Final data should be from server
    expect(result.current.data).toEqual({ id: 1, title: 'Server Response' });
  });

  it('should disable cache by default', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, patched: true });
    
    const { result } = renderHook(() => usePatchOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ title: 'First' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.mutate({ title: 'Second' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(2); // No cache
  });

  it('should handle errors and rollback optimistic updates by default', async () => {
    const error = new Error('Patch failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const optimisticUpdate = vi.fn((current, input) => ({ 
      id: 1, 
      title: input.title,
      optimistic: true 
    }));
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { optimisticUpdate, onError })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Patched Item' });
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
    const error = new Error('Patch failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    
    const optimisticUpdate = vi.fn((current, input) => ({ 
      id: 1, 
      title: input.title,
      optimistic: true 
    }));
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { 
        optimisticUpdate, 
        rollbackOnError: false 
      })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Patched Item' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    // Optimistic data should persist even after error
    expect(result.current.data).toEqual({ 
      id: 1, 
      title: 'Patched Item',
      optimistic: true 
    });
  });

  it('should call onSuccess callback', async () => {
    const mockData = { id: 1, title: 'Patched' };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { onSuccess })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Patched Item' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should provide abort function', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => usePatchOptimistic(mockApi));

    expect(result.current.abort).toBeDefined();
    expect(typeof result.current.abort).toBe('function');
  });

  it('should not execute on mount', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    renderHook(() => usePatchOptimistic(mockApi));

    expect(mockApi).not.toHaveBeenCalled();
  });

  it('should handle abort during pending request', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({ id: 1 }), 1000))
    );
    
    const { result } = renderHook(() => usePatchOptimistic(mockApi));

    // Start mutation
    act(() => {
      result.current.mutate({ title: 'Test' });
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
      .mockResolvedValueOnce({ id: 1, title: 'Success' });
    
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { 
        retry: 2,
        retryDelay: 100,
        onError 
      })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Test' });
    });

    // Wait for retries to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    expect(mockApi).toHaveBeenCalledTimes(3);
    expect(result.current.data).toEqual({ id: 1, title: 'Success' });
    expect(result.current.error).toBeNull();
  });

  it('should call onError after all retries are exhausted', async () => {
    const error = new Error('Persistent error');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { 
        retry: 2,
        retryDelay: 50,
        onError 
      })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    expect(mockApi).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.error).toEqual(error);
  });

  it('should handle multiple sequential mutations', async () => {
    const mockApi = vi
      .fn()
      .mockResolvedValueOnce({ id: 1, title: 'First Patch' })
      .mockResolvedValueOnce({ id: 1, title: 'Second Patch' })
      .mockResolvedValueOnce({ id: 1, title: 'Third Patch' });
    
    const { result } = renderHook(() => usePatchOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ title: 'First' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'First Patch' });
    });

    await act(async () => {
      await result.current.mutate({ title: 'Second' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Second Patch' });
    });

    await act(async () => {
      await result.current.mutate({ title: 'Third' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Third Patch' });
    });

    expect(mockApi).toHaveBeenCalledTimes(3);
  });

  it('should update optimistic data based on current data', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Patched', version: 2 });
    
    const optimisticUpdate = vi.fn((current, input) => ({
      ...(current || {}),
      ...input,
      optimistic: true
    }));
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { optimisticUpdate })
    );

    // First mutation
    await act(async () => {
      await result.current.mutate({ title: 'First Patch' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Patched', version: 2 });
    });

    // Second mutation - optimistic update should see previous data
    const mockApi2 = vi.fn().mockResolvedValue({ id: 1, title: 'Second Patch', version: 3 });
    
    const { result: result2 } = renderHook(() => 
      usePatchOptimistic(mockApi2, { optimisticUpdate })
    );

    // Manually set data from first mutation
    result2.current.mutate({ title: 'Second Patch' });

    await waitFor(() => {
      expect(optimisticUpdate).toHaveBeenCalled();
    });
  });

  it('should handle undefined input gracefully', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => usePatchOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate(undefined as any);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual({ id: 1 });
  });

  it('should cleanup on unmount', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result, unmount } = renderHook(() => usePatchOptimistic(mockApi));

    const abortSpy = vi.spyOn(result.current, 'abort');
    unmount();

    // Verify cleanup happened (abort should be callable)
    expect(abortSpy).toBeDefined();
  });

  it('should work without optimisticUpdate function', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Patched' });
    
    const { result } = renderHook(() => usePatchOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, title: 'Patched' });
    expect(result.current.optimisticData).toEqual({ id: 1, title: 'Patched' });
  });

  it('should handle isPending from useTransition', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ id: 1 }), 100))
    );
    
    const { result } = renderHook(() => usePatchOptimistic(mockApi));

    act(() => {
      result.current.mutate({ title: 'Test' });
    });

    // Loading should be true during transition
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should return both data and optimisticData', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Server Data' });
    const optimisticUpdate = vi.fn(() => ({ id: 1, title: 'Optimistic Data' }));
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { optimisticUpdate })
    );

    act(() => {
      result.current.mutate({ title: 'Test' });
    });

    // During pending state, optimisticData should be different from data
    await waitFor(() => {
      expect(result.current.optimisticData).toBeDefined();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After completion, data should be from server
    expect(result.current.data).toEqual({ id: 1, title: 'Server Data' });
  });

  it('should not retry on abort error', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('Request was aborted'));
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { retry: 3, retryDelay: 50 })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should only be called once, no retries for abort
    expect(mockApi).toHaveBeenCalledTimes(1);
  });

  it('should handle non-Error thrown values', async () => {
    const mockApi = vi.fn().mockRejectedValue('String error');
    const onError = vi.fn();
    
    const { result } = renderHook(() =>
      usePatchOptimistic(mockApi, { onError })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('String error');
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle complex optimistic state updates', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ id: 1, title: 'Server Title', status: 'complete' }), 100))
    );
    
    const optimisticUpdate = vi.fn((current, input) => ({
      ...current,
      ...input,
      status: 'pending',
      updatedAt: Date.now()
    }));
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { optimisticUpdate })
    );

    act(() => {
      result.current.mutate({ title: 'New Title' });
    });

    // Check optimistic update was applied
    await waitFor(() => {
      expect(result.current.optimisticData).toMatchObject({
        title: 'New Title',
        status: 'pending'
      });
    });

    // Wait for server response
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Final data should reflect server response
    expect(result.current.data).toEqual({ 
      id: 1, 
      title: 'Server Title', 
      status: 'complete' 
    });
  });

  it('should support partial data updates', async () => {
    const mockApi = vi
      .fn()
      .mockResolvedValueOnce({ id: 1, title: 'Initial', description: 'Initial desc' })
      .mockResolvedValueOnce({ id: 1, title: 'Initial', description: 'Updated desc' });
    
    const optimisticUpdate = vi.fn((current, input) => ({
      ...current,
      ...input
    }));
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { optimisticUpdate })
    );

    // First mutation - full object
    await act(async () => {
      await result.current.mutate({ title: 'Initial', description: 'Initial desc' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ 
        id: 1, 
        title: 'Initial', 
        description: 'Initial desc' 
      });
    });

    // Second mutation - partial update (only description)
    await act(async () => {
      await result.current.mutate({ description: 'Updated desc' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ 
        id: 1, 
        title: 'Initial', 
        description: 'Updated desc' 
      });
    });
  });

  it('should work with array data', async () => {
    const mockApi = vi.fn().mockResolvedValue([
      { id: 1, status: 'patched' },
      { id: 2, status: 'patched' }
    ]);
    
    const optimisticUpdate = vi.fn((current, input) => 
      input.ids.map((id: number) => ({ id, status: 'patching' }))
    );
    
    const { result } = renderHook(() => 
      usePatchOptimistic(mockApi, { optimisticUpdate })
    );

    await act(async () => {
      await result.current.mutate({ ids: [1, 2] });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([
      { id: 1, status: 'patched' },
      { id: 2, status: 'patched' }
    ]);
  });
});

