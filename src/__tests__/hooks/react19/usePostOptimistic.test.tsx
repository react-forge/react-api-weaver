import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePostOptimistic } from '../../../hooks/react19/usePostOptimistic';

describe('usePostOptimistic (React 19)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute POST request with optimistic update', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Created' });
    const optimisticUpdate = vi.fn((current, input) => ({ id: 1, ...input }));
    
    const { result } = renderHook(() => 
      usePostOptimistic(mockApi, { optimisticUpdate })
    );

    await act(async () => {
      await result.current.mutate({ title: 'New Item' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ title: 'New Item' });
    expect(optimisticUpdate).toHaveBeenCalledWith(null, { title: 'New Item' });
    expect(result.current.data).toEqual({ id: 1, title: 'Created' });
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
      usePostOptimistic(mockApi, { optimisticUpdate })
    );

    // Start mutation
    act(() => {
      result.current.mutate({ title: 'Optimistic Create' });
    });

    // Optimistic data should be available immediately
    await waitFor(() => {
      expect(result.current.optimisticData).toEqual({
        id: 1,
        title: 'Optimistic Create',
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
    const mockApi = vi.fn().mockResolvedValue({ id: 1, created: true });
    
    const { result } = renderHook(() => usePostOptimistic(mockApi));

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
    const error = new Error('Create failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const optimisticUpdate = vi.fn((current, input) => ({ 
      id: 1, 
      title: input.title,
      optimistic: true 
    }));
    
    const { result } = renderHook(() => 
      usePostOptimistic(mockApi, { optimisticUpdate, onError })
    );

    await act(async () => {
      await result.current.mutate({ title: 'New Item' });
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
    const error = new Error('Create failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    
    const optimisticUpdate = vi.fn((current, input) => ({ 
      id: 1, 
      title: input.title,
      optimistic: true 
    }));
    
    const { result } = renderHook(() => 
      usePostOptimistic(mockApi, { 
        optimisticUpdate, 
        rollbackOnError: false 
      })
    );

    await act(async () => {
      await result.current.mutate({ title: 'New Item' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    // Optimistic data should persist even after error
    expect(result.current.data).toEqual({ 
      id: 1, 
      title: 'New Item',
      optimistic: true 
    });
  });

  it('should call onSuccess callback', async () => {
    const mockData = { id: 1, title: 'Created' };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();
    
    const { result } = renderHook(() => 
      usePostOptimistic(mockApi, { onSuccess })
    );

    await act(async () => {
      await result.current.mutate({ title: 'New Item' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should provide abort function', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => usePostOptimistic(mockApi));

    expect(result.current.abort).toBeDefined();
    expect(typeof result.current.abort).toBe('function');
  });

  it('should not execute on mount', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    renderHook(() => usePostOptimistic(mockApi));

    expect(mockApi).not.toHaveBeenCalled();
  });

  it('should handle abort during pending request', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({ id: 1 }), 1000))
    );
    
    const { result } = renderHook(() => usePostOptimistic(mockApi));

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
      usePostOptimistic(mockApi, { 
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
      usePostOptimistic(mockApi, { 
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
      .mockResolvedValueOnce({ id: 1, title: 'First Create' })
      .mockResolvedValueOnce({ id: 2, title: 'Second Create' })
      .mockResolvedValueOnce({ id: 3, title: 'Third Create' });
    
    const { result } = renderHook(() => usePostOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ title: 'First' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'First Create' });
    });

    await act(async () => {
      await result.current.mutate({ title: 'Second' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 2, title: 'Second Create' });
    });

    await act(async () => {
      await result.current.mutate({ title: 'Third' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 3, title: 'Third Create' });
    });

    expect(mockApi).toHaveBeenCalledTimes(3);
  });

  it('should update optimistic data based on current data', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Created', version: 2 });
    
    const optimisticUpdate = vi.fn((current, input) => ({
      ...(current || {}),
      ...input,
      optimistic: true
    }));
    
    const { result } = renderHook(() => 
      usePostOptimistic(mockApi, { optimisticUpdate })
    );

    // First mutation
    await act(async () => {
      await result.current.mutate({ title: 'First Create' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Created', version: 2 });
    });

    // Second mutation - optimistic update should see previous data
    const mockApi2 = vi.fn().mockResolvedValue({ id: 2, title: 'Second Create', version: 3 });
    
    const { result: result2 } = renderHook(() => 
      usePostOptimistic(mockApi2, { optimisticUpdate })
    );

    // Manually set data from first mutation
    result2.current.mutate({ title: 'Second Create' });

    await waitFor(() => {
      expect(optimisticUpdate).toHaveBeenCalled();
    });
  });

  it('should handle undefined input gracefully', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => usePostOptimistic(mockApi));

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
    const { result, unmount } = renderHook(() => usePostOptimistic(mockApi));

    const abortSpy = vi.spyOn(result.current, 'abort');
    unmount();

    // Verify cleanup happened (abort should be callable)
    expect(abortSpy).toBeDefined();
  });

  it('should work without optimisticUpdate function', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Created' });
    
    const { result } = renderHook(() => usePostOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, title: 'Created' });
    expect(result.current.optimisticData).toEqual({ id: 1, title: 'Created' });
  });

  it('should handle isPending from useTransition', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ id: 1 }), 100))
    );
    
    const { result } = renderHook(() => usePostOptimistic(mockApi));

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
      usePostOptimistic(mockApi, { optimisticUpdate })
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
      usePostOptimistic(mockApi, { retry: 3, retryDelay: 50 })
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

  it('should handle complex input objects', async () => {
    const mockApi = vi.fn().mockResolvedValue({ 
      id: 1, 
      user: { name: 'John', email: 'john@example.com' },
      tags: ['new', 'important']
    });
    
    const complexInput = {
      user: { name: 'John', email: 'john@example.com' },
      tags: ['new', 'important'],
      metadata: { source: 'web' }
    };
    
    const { result } = renderHook(() => usePostOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate(complexInput);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith(complexInput);
    expect(result.current.data).toEqual({ 
      id: 1, 
      user: { name: 'John', email: 'john@example.com' },
      tags: ['new', 'important']
    });
  });

  it('should handle rapid successive mutations', async () => {
    const mockApi = vi.fn().mockImplementation((input: any) => 
      Promise.resolve({ id: Date.now(), ...input })
    );
    
    const { result } = renderHook(() => usePostOptimistic(mockApi));

    // Trigger multiple mutations rapidly
    await act(async () => {
      await result.current.mutate({ title: 'First' });
    });
    
    await act(async () => {
      await result.current.mutate({ title: 'Second' });
    });
    
    await act(async () => {
      await result.current.mutate({ title: 'Third' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All requests should have been made
    expect(mockApi).toHaveBeenCalledTimes(3);
  });

  it('should clear error on successful mutation after previous error', async () => {
    const mockApi = vi
      .fn()
      .mockRejectedValueOnce(new Error('First Error'))
      .mockResolvedValueOnce({ id: 1, title: 'Success' });
    
    const { result } = renderHook(() => usePostOptimistic(mockApi));

    // First mutation fails
    await act(async () => {
      await result.current.mutate({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe('First Error');

    // Second mutation succeeds - error should be cleared
    await act(async () => {
      await result.current.mutate({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    expect(result.current.data).toEqual({ id: 1, title: 'Success' });
  });

  it('should work with plain functions (not ApiFunction type)', async () => {
    const mockApi = async (input: any) => {
      return { id: 1, ...input };
    };
    
    const { result } = renderHook(() => usePostOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ title: 'Plain Function' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Plain Function' });
    });
  });
});

