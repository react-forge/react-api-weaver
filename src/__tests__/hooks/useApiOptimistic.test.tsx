import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApiOptimistic } from '../../hooks/useApiOptimistic';

describe('useApiOptimistic', () => {
  it('should initialize with null data', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test' });
    const { result } = renderHook(() => useApiOptimistic(mockApi));

    expect(result.current.data).toBeNull();
    expect(result.current.optimisticData).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call mutate function and update data', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test Todo' });
    const { result } = renderHook(() => useApiOptimistic(mockApi));

    await act(async () => {
      await result.current.mutate({ title: 'Test Todo' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ title: 'Test Todo' });
    expect(result.current.data).toEqual({ id: 1, title: 'Test Todo' });
  });

  it('should apply optimistic update before API call', async () => {
    const mockApi = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ id: 1, title: 'Test Todo' }), 100);
      });
    });

    const optimisticUpdate = vi.fn((current, input) => ({
      id: Date.now(),
      ...input,
    }));

    const { result } = renderHook(() =>
      useApiOptimistic(mockApi, { optimisticUpdate })
    );

    await act(async () => {
      result.current.mutate({ title: 'Test Todo' });
    });

    // Optimistic update should be called
    await waitFor(() => {
      expect(optimisticUpdate).toHaveBeenCalled();
    });
  });

  it('should handle errors', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('API Error'));
    const onError = vi.fn();
    
    const { result } = renderHook(() =>
      useApiOptimistic(mockApi, { onError })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Test Todo' });
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe('API Error');
    expect(onError).toHaveBeenCalled();
  });

  it('should call onSuccess callback on successful mutation', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test Todo' });
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useApiOptimistic(mockApi, { onSuccess })
    );

    await act(async () => {
      await result.current.mutate({ title: 'Test Todo' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ id: 1, title: 'Test Todo' });
    });
  });

  it('should support abort functionality', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test' });
    const { result } = renderHook(() => useApiOptimistic(mockApi));

    expect(result.current.abort).toBeDefined();
    expect(typeof result.current.abort).toBe('function');
    
    // Should not throw
    act(() => {
      result.current.abort();
    });
  });
});

