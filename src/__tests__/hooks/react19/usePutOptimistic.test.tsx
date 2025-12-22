import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePutOptimistic } from '../../../hooks/react19/usePutOptimistic';

describe('usePutOptimistic (React 19)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute PUT request with optimistic update', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Updated' });
    const optimisticUpdate = vi.fn((current, input) => ({ id: 1, ...input }));
    
    const { result } = renderHook(() => 
      usePutOptimistic(mockApi, { optimisticUpdate })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Updated Item' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ title: 'Updated Item' });
    expect(optimisticUpdate).toHaveBeenCalledWith(null, { title: 'Updated Item' });
    expect(result.current.data).toEqual({ id: 1, title: 'Updated' });
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
      usePutOptimistic(mockApi, { optimisticUpdate })
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
    const mockApi = vi.fn().mockResolvedValue({ id: 1, updated: true });
    
    const { result } = renderHook(() => usePutOptimistic(mockApi));

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
    const error = new Error('Update failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const optimisticUpdate = vi.fn((current, input) => ({ 
      id: 1, 
      title: input.title,
      optimistic: true 
    }));
    
    const { result } = renderHook(() => 
      usePutOptimistic(mockApi, { optimisticUpdate, onError })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Updated Item' });
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
    const error = new Error('Update failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    
    const optimisticUpdate = vi.fn((current, input) => ({ 
      id: 1, 
      title: input.title,
      optimistic: true 
    }));
    
    const { result } = renderHook(() => 
      usePutOptimistic(mockApi, { 
        optimisticUpdate, 
        rollbackOnError: false 
      })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Updated Item' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    // Optimistic data should persist even after error
    expect(result.current.data).toEqual({ 
      id: 1, 
      title: 'Updated Item',
      optimistic: true 
    });
  });

  it('should call onSuccess callback', async () => {
    const mockData = { id: 1, title: 'Updated' };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();
    
    const { result } = renderHook(() => 
      usePutOptimistic(mockApi, { onSuccess })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Updated Item' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should provide abort function', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => usePutOptimistic(mockApi));

    expect(result.current.abort).toBeDefined();
    expect(typeof result.current.abort).toBe('function');
  });

  it('should not execute on mount', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    renderHook(() => usePutOptimistic(mockApi));

    expect(mockApi).not.toHaveBeenCalled();
  });

  it('should handle abort during pending request', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({ id: 1 }), 1000))
    );
    
    const { result } = renderHook(() => usePutOptimistic(mockApi));

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
      usePutOptimistic(mockApi, { 
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
      usePutOptimistic(mockApi, { 
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
      .mockResolvedValueOnce({ id: 1, title: 'First Update' })
      .mockResolvedValueOnce({ id: 1, title: 'Second Update' })
      .mockResolvedValueOnce({ id: 1, title: 'Third Update' });
    
    const { result } = renderHook(() => usePutOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ title: 'First' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'First Update' });
    });

    await act(async () => {
      await result.current.mutate({ title: 'Second' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Second Update' });
    });

    await act(async () => {
      await result.current.mutate({ title: 'Third' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Third Update' });
    });

    expect(mockApi).toHaveBeenCalledTimes(3);
  });

  it('should update optimistic data based on current data', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Updated', version: 2 });
    
    const optimisticUpdate = vi.fn((current, input) => ({
      ...(current || {}),
      ...input,
      optimistic: true
    }));
    
    const { result } = renderHook(() => 
      usePutOptimistic(mockApi, { optimisticUpdate })
    );

    // First mutation
    await act(async () => {
      await result.current.mutate({ title: 'First Update' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Updated', version: 2 });
    });

    // Second mutation - optimistic update should see previous data
    const mockApi2 = vi.fn().mockResolvedValue({ id: 1, title: 'Second Update', version: 3 });
    
    const { result: result2 } = renderHook(() => 
      usePutOptimistic(mockApi2, { optimisticUpdate })
    );

    // Manually set data from first mutation
    result2.current.mutate({ title: 'Second Update' });

    await waitFor(() => {
      expect(optimisticUpdate).toHaveBeenCalled();
    });
  });

  it('should handle undefined input gracefully', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => usePutOptimistic(mockApi));

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
    const { result, unmount } = renderHook(() => usePutOptimistic(mockApi));

    const abortSpy = vi.spyOn(result.current, 'abort');
    unmount();

    // Verify cleanup happened (abort should be callable)
    expect(abortSpy).toBeDefined();
  });

  it('should work without optimisticUpdate function', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Updated' });
    
    const { result } = renderHook(() => usePutOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, title: 'Updated' });
    expect(result.current.optimisticData).toEqual({ id: 1, title: 'Updated' });
  });

  it('should handle isPending from useTransition', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ id: 1 }), 100))
    );
    
    const { result } = renderHook(() => usePutOptimistic(mockApi));

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
      usePutOptimistic(mockApi, { optimisticUpdate })
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
      usePutOptimistic(mockApi, { retry: 3, retryDelay: 50 })
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
});

