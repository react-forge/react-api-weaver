import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApiAction } from '../../../hooks/react19/useApiAction';

describe('useApiAction (React 19)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(result.current.error).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('should execute action and update data', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test Todo' });
    const { result } = renderHook(() => useApiAction(mockApi));

    await act(async () => {
      await result.current.action({ title: 'Test Todo' });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Test Todo' });
    });

    expect(mockApi).toHaveBeenCalledWith({ title: 'Test Todo' });
    expect(result.current.error).toBeNull();
  });

  it('should set isPending to true during action execution', async () => {
    const mockApi = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ id: 1, title: 'Test' }), 100))
    );
    
    const { result } = renderHook(() => useApiAction(mockApi));

    // Execute action within act
    await act(async () => {
      await result.current.action({ title: 'Test' });
    });

    // Wait for state to update after action completes
    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Test' });
    });

    // After completion, isPending should be false
    expect(result.current.isPending).toBe(false);
    expect(mockApi).toHaveBeenCalledTimes(1);
  });

  it('should handle errors in action', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('API Error'));
    const onError = vi.fn();
    
    const { result } = renderHook(() =>
      useApiAction(mockApi, { onError })
    );

    await act(async () => {
      await result.current.action({ title: 'Test Todo' });
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe('API Error');
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'API Error'
    }));
    expect(result.current.data).toBeNull();
  });

  it('should preserve previous data on error', async () => {
    const mockApi = vi
      .fn()
      .mockResolvedValueOnce({ id: 1, title: 'First Success' })
      .mockRejectedValueOnce(new Error('Second Failed'));
    
    const { result } = renderHook(() => useApiAction(mockApi));

    // First successful action
    await act(async () => {
      await result.current.action({ title: 'First' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'First Success' });
    });

    // Second action fails - should preserve previous data
    await act(async () => {
      await result.current.action({ title: 'Second' });
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Data should be preserved from the first successful action
    expect(result.current.data).toEqual({ id: 1, title: 'First Success' });
  });

  it('should call onSuccess callback on successful action', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test Todo' });
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useApiAction(mockApi, { onSuccess })
    );

    await act(async () => {
      await result.current.action({ title: 'Test Todo' });
    });

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

    await act(async () => {
      await result.current.formAction(formData);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({ title: 'Test Todo' });
    expect(result.current.data).toEqual({ id: 1, title: 'Test Todo' });
  });

  it('should handle FormData with multiple fields', async () => {
    const mockApi = vi.fn().mockResolvedValue({ 
      id: 1, 
      title: 'Test Todo', 
      description: 'Test Description',
      priority: 'high'
    });
    
    const { result } = renderHook(() => useApiAction(mockApi));

    const formData = new FormData();
    formData.append('title', 'Test Todo');
    formData.append('description', 'Test Description');
    formData.append('priority', 'high');

    await act(async () => {
      await result.current.formAction(formData);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({
      title: 'Test Todo',
      description: 'Test Description',
      priority: 'high'
    });
  });

  it('should handle errors in formAction', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('Form submission failed'));
    const onError = vi.fn();
    
    const { result } = renderHook(() =>
      useApiAction(mockApi, { onError })
    );

    const formData = new FormData();
    formData.append('title', 'Test Todo');

    await act(async () => {
      await result.current.formAction(formData);
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe('Form submission failed');
    expect(onError).toHaveBeenCalled();
  });

  it('should call onSuccess callback on successful formAction', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test Todo' });
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useApiAction(mockApi, { onSuccess })
    );

    const formData = new FormData();
    formData.append('title', 'Test Todo');

    await act(async () => {
      await result.current.formAction(formData);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ id: 1, title: 'Test Todo' });
    });
  });

  it('should handle multiple sequential actions', async () => {
    const mockApi = vi
      .fn()
      .mockResolvedValueOnce({ id: 1, title: 'First' })
      .mockResolvedValueOnce({ id: 2, title: 'Second' })
      .mockResolvedValueOnce({ id: 3, title: 'Third' });
    
    const { result } = renderHook(() => useApiAction(mockApi));

    // First action
    await act(async () => {
      await result.current.action({ title: 'First' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'First' });
    });

    // Second action
    await act(async () => {
      await result.current.action({ title: 'Second' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 2, title: 'Second' });
    });

    // Third action
    await act(async () => {
      await result.current.action({ title: 'Third' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 3, title: 'Third' });
    });

    expect(mockApi).toHaveBeenCalledTimes(3);
  });

  it('should handle non-Error thrown values', async () => {
    const mockApi = vi.fn().mockRejectedValue('String error');
    const onError = vi.fn();
    
    const { result } = renderHook(() =>
      useApiAction(mockApi, { onError })
    );

    await act(async () => {
      await result.current.action({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('String error');
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle empty FormData', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, success: true });
    const { result } = renderHook(() => useApiAction(mockApi));

    const formData = new FormData();

    await act(async () => {
      await result.current.formAction(formData);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith({});
    expect(result.current.data).toEqual({ id: 1, success: true });
  });

  it('should clear error on successful action after previous error', async () => {
    const mockApi = vi
      .fn()
      .mockRejectedValueOnce(new Error('First Error'))
      .mockResolvedValueOnce({ id: 1, title: 'Success' });
    
    const { result } = renderHook(() => useApiAction(mockApi));

    // First action fails
    await act(async () => {
      await result.current.action({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe('First Error');

    // Second action succeeds - error should be cleared
    await act(async () => {
      await result.current.action({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    expect(result.current.data).toEqual({ id: 1, title: 'Success' });
  });

  it('should work with plain functions (not ApiFunction type)', async () => {
    const mockApi = async (input: { title: string }) => {
      return { id: 1, ...input };
    };
    
    const { result } = renderHook(() => useApiAction(mockApi));

    await act(async () => {
      await result.current.action({ title: 'Plain Function' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Plain Function' });
    });
  });

  it('should handle undefined input', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, success: true });
    const { result } = renderHook(() => useApiAction(mockApi));

    await act(async () => {
      await result.current.action(undefined as any);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual({ id: 1, success: true });
  });

  it('should not call callbacks if not provided', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useApiAction(mockApi));

    await act(async () => {
      await result.current.action({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    // Should complete without errors even without callbacks
    expect(result.current.data).toEqual({ id: 1 });
  });

  it('should provide stable action and formAction functions', () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useApiAction(mockApi));

    // Both action functions should be defined and functional
    expect(result.current.action).toBeDefined();
    expect(result.current.formAction).toBeDefined();
    expect(typeof result.current.action).toBe('function');
    expect(typeof result.current.formAction).toBe('function');
  });

  it('should handle rapid successive actions', async () => {
    const mockApi = vi.fn().mockImplementation((input: any) => 
      Promise.resolve({ id: Date.now(), ...input })
    );
    
    const { result } = renderHook(() => useApiAction(mockApi));

    // Trigger multiple actions sequentially (useActionState processes them in order)
    await act(async () => {
      await result.current.action({ title: 'First' });
    });
    
    await act(async () => {
      await result.current.action({ title: 'Second' });
    });
    
    await act(async () => {
      await result.current.action({ title: 'Third' });
    });

    // All actions should have been called
    expect(mockApi).toHaveBeenCalledTimes(3);
  });

  it('should handle FormData with file inputs', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, uploaded: true });
    const { result } = renderHook(() => useApiAction(mockApi));

    const formData = new FormData();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    formData.append('title', 'Document Upload');
    formData.append('file', file);

    await act(async () => {
      await result.current.formAction(formData);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockApi).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Document Upload',
        file: expect.any(File)
      })
    );
  });

  it('should work without any options', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1, title: 'Test' });
    const { result } = renderHook(() => useApiAction(mockApi));

    await act(async () => {
      await result.current.action({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1, title: 'Test' });
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle callback errors gracefully', async () => {
    const mockApi = vi.fn().mockResolvedValue({ id: 1 });
    const onSuccess = vi.fn();
    
    const { result } = renderHook(() =>
      useApiAction(mockApi, { onSuccess })
    );

    await act(async () => {
      await result.current.action({ title: 'Test' });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
    expect(result.current.data).toEqual({ id: 1 });
  });
});

