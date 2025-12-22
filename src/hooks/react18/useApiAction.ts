import { useState, useCallback, useTransition } from 'react';
import { 
  UseApiActionOptions, 
  UseApiActionResult, 
  ApiFunction 
} from '../../types';

/**
 * Hook for form-based API interactions (React 18)
 * Uses manual state management with useTransition for pending states
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

  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<TData | null>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [manualPending, setManualPending] = useState(false);

  /**
   * Execute the action
   */
  const executeAction = useCallback(
    async (input: TInput): Promise<void> => {
      try {
        setManualPending(true);
        setError(null);

        const result = await apiFunction(input as any);

        setData(result);
        setManualPending(false);
        onSuccess?.(result);
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setManualPending(false);
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
      await executeAction(input);
    },
    [executeAction]
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

  return {
    data,
    error,
    isPending: manualPending || isPending,
    action,
    formAction,
  };
}

