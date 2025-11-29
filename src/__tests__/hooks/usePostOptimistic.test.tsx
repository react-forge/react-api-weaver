import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePostOptimistic } from '../../hooks/usePostOptimistic';

describe('usePostOptimistic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute POST request with optimistic update', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Created' });
    const optimisticUpdate = vi.fn((current, input) => ({ id: 0, ...input }));
    
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
    expect(result.current.data).toEqual({ id: 1, title: 'Created' });
  });

  it('should disable cache by default', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    
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

  it('should handle errors', async () => {
    const error = new Error('Creation failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      usePostOptimistic(mockApi, { onError })
    );

    await act(async () => {
      await result.current.mutate({ title: 'New Item' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(onError).toHaveBeenCalledWith(error);
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
});

