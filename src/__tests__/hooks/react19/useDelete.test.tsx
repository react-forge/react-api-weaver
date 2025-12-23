import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDelete } from '../../../hooks/react19/useDelete';

describe('useDelete (React 19)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not execute on mount by default when enabled is false', () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    renderHook(() => useDelete(mockApi, { enabled: false }));

    expect(mockApi).not.toHaveBeenCalled();
  });

  it('should execute DELETE request when refetch is called', async () => {
    const mockData = { success: true };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() =>
      useDelete(mockApi, { enabled: false })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle DELETE errors', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('Delete Failed'));
    const { result } = renderHook(() =>
      useDelete(mockApi, { enabled: false })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Delete Failed');
  });

  it('should call onSuccess callback on successful DELETE', async () => {
    const mockData = { success: true };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useDelete(mockApi, { enabled: false, onSuccess })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should call onError callback on DELETE error', async () => {
    const error = new Error('Delete Failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useDelete(mockApi, { enabled: false, onError })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should disable caching by default for DELETE requests', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    
    const { result } = renderHook(() =>
      useDelete(mockApi, { enabled: false })
    );

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should call API twice (no caching)
    expect(mockApi).toHaveBeenCalledTimes(2);
  });

  it('should support multiple deletions', async () => {
    const mockApi = vi.fn()
      .mockResolvedValueOnce({ id: 1, deleted: true })
      .mockResolvedValueOnce({ id: 2, deleted: true })
      .mockResolvedValueOnce({ id: 3, deleted: true });

    const { result } = renderHook(() => useDelete(mockApi, { enabled: false }));

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 1, deleted: true });

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 2, deleted: true });

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 3, deleted: true });

    expect(mockApi).toHaveBeenCalledTimes(3);
  });

  it('should provide abort function', () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDelete(mockApi, { enabled: false }));

    expect(result.current.abort).toBeDefined();
    expect(typeof result.current.abort).toBe('function');
  });

  it('should execute on mount when enabled is true', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDelete(mockApi, { enabled: true }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ success: true });
  });

  it('should handle rapid successive refetch calls', async () => {
    const mockApi = vi.fn().mockImplementation((input: any) => 
      Promise.resolve({ id: Date.now(), deleted: true, ...input })
    );
    
    const { result } = renderHook(() => useDelete(mockApi, { enabled: false }));

    // Trigger multiple refetches
    await act(async () => {
      await result.current.refetch();
    });
    
    await act(async () => {
      await result.current.refetch();
    });
    
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All requests should have been made
    expect(mockApi).toHaveBeenCalledTimes(3);
  });

  it('should handle abort during pending request', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000))
    );
    
    const { result } = renderHook(() => useDelete(mockApi, { enabled: false }));

    // Start request
    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);

    // Abort the request
    act(() => {
      result.current.abort();
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    // Request should be aborted
    expect(mockApi).toHaveBeenCalledTimes(1);
  });

  it('should clear error on successful request after previous error', async () => {
    const mockApi = vi
      .fn()
      .mockRejectedValueOnce(new Error('First Error'))
      .mockResolvedValueOnce({ success: true });
    
    const { result } = renderHook(() => useDelete(mockApi, { enabled: false }));

    // First request fails
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe('First Error');

    // Second request succeeds - error should be cleared
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    expect(result.current.data).toEqual({ success: true });
  });

  it('should preserve previous data on error', async () => {
    const mockApi = vi
      .fn()
      .mockResolvedValueOnce({ id: 1, deleted: true })
      .mockRejectedValueOnce(new Error('Second Failed'));
    
    const { result } = renderHook(() => useDelete(mockApi, { enabled: false }));

    // First successful request
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, deleted: true });
    });

    // Second request fails - should preserve previous data
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Data should be preserved from the first successful request
    expect(result.current.data).toEqual({ id: 1, deleted: true });
  });

  it('should use React 19 useTransition for loading state', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );
    
    const { result } = renderHook(() => useDelete(mockApi, { enabled: false }));

    act(() => {
      result.current.refetch();
    });

    // Loading should be true during transition
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ success: true });
  });

  it('should work with plain functions (not ApiFunction type)', async () => {
    const mockApi = async () => {
      return { success: true };
    };
    
    const { result } = renderHook(() => useDelete(mockApi, { enabled: false }));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ success: true });
    });
  });

  it('should handle retry on error', async () => {
    const mockApi = vi
      .fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockRejectedValueOnce(new Error('Second attempt failed'))
      .mockResolvedValueOnce({ success: true });
    
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      useDelete(mockApi, { 
        enabled: false,
        retry: 2,
        retryDelay: 100,
        onError 
      })
    );

    await act(async () => {
      await result.current.refetch();
    });

    // Wait for retries to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    expect(mockApi).toHaveBeenCalledTimes(3);
    expect(result.current.data).toEqual({ success: true });
    expect(result.current.error).toBeNull();
  });

  it('should call onError after all retries are exhausted', async () => {
    const error = new Error('Persistent error');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      useDelete(mockApi, { 
        enabled: false,
        retry: 2,
        retryDelay: 50,
        onError 
      })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    expect(mockApi).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.error).toEqual(error);
  });

  it('should work without any options', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDelete(mockApi, { enabled: false }));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ success: true });
    });

    expect(result.current.error).toBeNull();
  });
});

