import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePatch } from '../../../hooks/react19/usePatch';

describe('usePatch (React 19)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not execute on mount by default when enabled is false', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Updated Todo' });
    renderHook(() => usePatch(mockApi, { enabled: false }));

    expect(mockApi).not.toHaveBeenCalled();
  });

  it('should execute PATCH request when refetch is called', async () => {
    const mockData = { id: 1, title: 'Updated Todo' };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() =>
      usePatch(mockApi, { enabled: false })
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

  it('should handle PATCH errors', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('Update Failed'));
    const { result } = renderHook(() =>
      usePatch(mockApi, { enabled: false })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Update Failed');
  });

  it('should call onSuccess callback on successful PATCH', async () => {
    const mockData = { id: 1, title: 'Updated Todo' };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      usePatch(mockApi, { enabled: false, onSuccess })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should call onError callback on PATCH error', async () => {
    const error = new Error('Update Failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(() =>
      usePatch(mockApi, { enabled: false, onError })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should disable caching by default for PATCH requests', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Updated Todo' });
    
    const { result } = renderHook(() =>
      usePatch(mockApi, { enabled: false })
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

  it('should support multiple mutations', async () => {
    const mockApi = vi.fn()
      .mockResolvedValueOnce({ id: 1, title: 'First Update' })
      .mockResolvedValueOnce({ id: 2, title: 'Second Update' })
      .mockResolvedValueOnce({ id: 3, title: 'Third Update' });

    const { result } = renderHook(() => usePatch(mockApi, { enabled: false }));

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 1, title: 'First Update' });

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 2, title: 'Second Update' });

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 3, title: 'Third Update' });

    expect(mockApi).toHaveBeenCalledTimes(3);
  });

  it('should provide abort function', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => usePatch(mockApi, { enabled: false }));

    expect(result.current.abort).toBeDefined();
    expect(typeof result.current.abort).toBe('function');
  });

  it('should execute on mount when enabled is true', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Updated Todo' });
    const { result } = renderHook(() => usePatch(mockApi, { enabled: true }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ id: 1, title: 'Updated Todo' });
  });

  it('should handle rapid successive refetch calls', async () => {
    const mockApi = vi.fn().mockImplementation((input: any) => 
      Promise.resolve({ id: Date.now(), updated: true, ...input })
    );
    
    const { result } = renderHook(() => usePatch(mockApi, { enabled: false }));

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
      new Promise((resolve) => setTimeout(() => resolve({ id: 1 }), 1000))
    );
    
    const { result } = renderHook(() => usePatch(mockApi, { enabled: false }));

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
      .mockResolvedValueOnce({ id: 1, title: 'Success' });
    
    const { result } = renderHook(() => usePatch(mockApi, { enabled: false }));

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

    expect(result.current.data).toEqual({ id: 1, title: 'Success' });
  });

  it('should preserve previous data on error', async () => {
    const mockApi = vi
      .fn()
      .mockResolvedValueOnce({ id: 1, title: 'First Success' })
      .mockRejectedValueOnce(new Error('Second Failed'));
    
    const { result } = renderHook(() => usePatch(mockApi, { enabled: false }));

    // First successful request
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'First Success' });
    });

    // Second request fails - should preserve previous data
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Data should be preserved from the first successful request
    expect(result.current.data).toEqual({ id: 1, title: 'First Success' });
  });

  it('should use React 19 useTransition for loading state', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ id: 1 }), 100))
    );
    
    const { result } = renderHook(() => usePatch(mockApi, { enabled: false }));

    act(() => {
      result.current.refetch();
    });

    // Loading should be true during transition
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1 });
  });

  it('should work with plain functions (not ApiFunction type)', async () => {
    const mockApi = async () => {
      return { id: 1, title: 'Plain Function' };
    };
    
    const { result } = renderHook(() => usePatch(mockApi, { enabled: false }));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Plain Function' });
    });
  });

  it('should handle retry on error', async () => {
    const mockApi = vi
      .fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockRejectedValueOnce(new Error('Second attempt failed'))
      .mockResolvedValueOnce({ id: 1, title: 'Success' });
    
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      usePatch(mockApi, { 
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
    expect(result.current.data).toEqual({ id: 1, title: 'Success' });
    expect(result.current.error).toBeNull();
  });

  it('should call onError after all retries are exhausted', async () => {
    const error = new Error('Persistent error');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      usePatch(mockApi, { 
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
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test' });
    const { result } = renderHook(() => usePatch(mockApi, { enabled: false }));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Test' });
    });

    expect(result.current.error).toBeNull();
  });
});

