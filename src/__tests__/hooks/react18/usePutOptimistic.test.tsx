import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePutOptimistic } from '../../../hooks/react18/usePutOptimistic';

describe('usePutOptimistic', () => {
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
    expect(result.current.data).toEqual({ id: 1, title: 'Updated' });
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

  it('should handle errors', async () => {
    const error = new Error('Update failed');
    const mockApi = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      usePutOptimistic(mockApi, { onError })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Updated Item' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(onError).toHaveBeenCalledWith(error);
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
});

