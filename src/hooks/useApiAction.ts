import { useState, useCallback, useTransition } from 'react';
import { 
  UseApiActionOptions, 
  UseApiActionResult, 
  ApiFunction 
} from '../types';
import { isReact19OrLater, getReact19Hook } from '../utils/react-version';

/**
 * Hook for form-based API interactions with React 19's useActionState
 * Falls back to manual state management for React 17/18
 * 
 * @param apiFunction - The API function to execute
 * @param options - Configuration options
 * @returns API result with action functions for forms and direct calls
 */
export function useApiAction<TData = any, TInput = any>(
  apiFunction: ApiFunction<TData, TInput> | ((input: TInput) => Promise<TData>),
  options: UseApiActionOptions<TData> = {}
): UseApiActionResult<TData, TInput> {
  const {
    onSuccess,
    onError,
    initialData = null,
  } = options;

  // Try to get React 19's useActionState hook
  const useActionState = getReact19Hook<any>('useActionState');
  const [isPending, startTransition] = useTransition();

  // State for React 17/18 fallback
  const [data, setData] = useState<TData | null>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [manualPending, setManualPending] = useState(false);

  /**
   * Execute the action
   */
  const executeAction = useCallback(
    async (input: TInput): Promise<void> => {
      try {
        if (!isReact19OrLater()) {
          setManualPending(true);
        }
        setError(null);

        const result = await apiFunction(input as any);

        setData(result);
        if (!isReact19OrLater()) {
          setManualPending(false);
        }
        onSuccess?.(result);
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        if (!isReact19OrLater()) {
          setManualPending(false);
        }
        onError?.(errorObj);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  /**
   * Action function for direct calls
   */
  const action = useCallback(
    async (input: TInput): Promise<void> => {
      if (isReact19OrLater()) {
        startTransition(() => {
          executeAction(input);
        });
      } else {
        await executeAction(input);
      }
    },
    [executeAction, startTransition]
  );

  /**
   * Form action function that extracts data from FormData
   */
  const formAction = useCallback(
    async (formData: FormData): Promise<void> => {
      // Convert FormData to object
      const input = Object.fromEntries(formData.entries()) as TInput;
      await action(input);
    },
    [action]
  );

  // Use React 19's useActionState if available
  if (useActionState && isReact19OrLater()) {
    const [state, formActionFn, isPendingState] = useActionState(
      async (previousState: { data: TData | null; error: Error | null }, input: TInput) => {
        try {
          const result = await apiFunction(input as any);
          onSuccess?.(result);
          return { data: result, error: null };
        } catch (err: any) {
          const errorObj = err instanceof Error ? err : new Error(String(err));
          onError?.(errorObj);
          return { data: previousState.data, error: errorObj };
        }
      },
      { data: initialData, error: null }
    );

    return {
      data: state.data,
      error: state.error,
      isPending: isPendingState,
      action: async (input: TInput) => {
        startTransition(() => {
          formActionFn(input);
        });
      },
      formAction: async (formData: FormData) => {
        const input = Object.fromEntries(formData.entries()) as TInput;
        startTransition(() => {
          formActionFn(input);
        });
      },
    };
  }

  // React 17/18 fallback
  return {
    data,
    error,
    isPending: manualPending || isPending,
    action,
    formAction,
  };
}

