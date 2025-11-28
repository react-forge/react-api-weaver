import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiAction } from '../../hooks/useApiAction';

describe('useApiAction', () => {
  it('should initialize with initial data and no error', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test' });
    const { result } = renderHook(() => useApiAction(mockApi));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('should initialize with custom initial data', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test' });
    const initialData = { id: 0, title: 'Initial' };
    
    const { result } = renderHook(() =>
      useApiAction(mockApi, { initialData })
    );

    expect(result.current.data).toEqual(initialData);
  });

  it('should execute action and update data', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test Todo' });
    const { result } = renderHook(() => useApiAction(mockApi));

    await result.current.action({ title: 'Test Todo' });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ title: 'Test Todo' });
    expect(result.current.data).toEqual({ id: 1, title: 'Test Todo' });
  });

  it('should handle errors in action', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('API Error'));
    const onError = vi.fn();
    
    const { result } = renderHook(() =>
      useApiAction(mockApi, { onError })
    );

    await result.current.action({ title: 'Test Todo' });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe('API Error');
    expect(onError).toHaveBeenCalled();
  });

  it('should call onSuccess callback on successful action', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test Todo' });
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useApiAction(mockApi, { onSuccess })
    );

    await result.current.action({ title: 'Test Todo' });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ id: 1, title: 'Test Todo' });
    });
  });

  it('should provide formAction function', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test' });
    const { result } = renderHook(() => useApiAction(mockApi));

    expect(result.current.formAction).toBeDefined();
    expect(typeof result.current.formAction).toBe('function');
  });

  it('should handle FormData in formAction', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test Todo' });
    const { result } = renderHook(() => useApiAction(mockApi));

    const formData = new FormData();
    formData.append('title', 'Test Todo');

    await result.current.formAction(formData);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ title: 'Test Todo' });
  });
});

