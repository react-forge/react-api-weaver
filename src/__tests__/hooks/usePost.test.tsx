import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePost } from '../../hooks/usePost';

describe('usePost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not execute on mount by default when enabled is false', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'New Todo' });
    renderHook(() => usePost(mockApi, { enabled: false }));

    expect(mockApi).not.toHaveBeenCalled();
  });

  it('should execute POST request when refetch is called', async () => {
    const mockData = { id: 1, title: 'New Todo' };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() =>
      usePost(mockApi, { enabled: false })
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

  it('should handle POST errors', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('Server Error'));
    const { result } = renderHook(() =>
      usePost(mockApi, { enabled: false })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Server Error');
  });

  it('should call onSuccess callback on successful POST', async () => {
    const mockData = { id: 1, title: 'New Todo' };
    const mockApi = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      usePost(mockApi, { enabled: false, onSuccess })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should call onError callback on POST error', async () => {
    const error = new Error('Server Error');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(() =>
      usePost(mockApi, { enabled: false, onError })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should disable caching by default for POST requests', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'New Todo' });
    
    const { result } = renderHook(() =>
      usePost(mockApi, { enabled: false })
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
      .mockResolvedValueOnce({ id: 1, title: 'First' })
      .mockResolvedValueOnce({ id: 2, title: 'Second' })
      .mockResolvedValueOnce({ id: 3, title: 'Third' });

    const { result } = renderHook(() => usePost(mockApi, { enabled: false }));

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 1, title: 'First' });

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 2, title: 'Second' });

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 3, title: 'Third' });

    expect(mockApi).toHaveBeenCalledTimes(3);
  });
});

