import { useActionState } from 'react';
import { 
  UseApiActionOptions, 
  UseApiActionResult, 
  ApiFunction 
} from '../../types';

/**
 * State shape for useActionState
 */
interface ActionState<TData> {
  data: TData | null;
  error: Error | null;
}

/**
 * Hook for form-based API interactions (React 19)
 * Uses native useActionState for form actions
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

  // Use React 19's useActionState for form actions
  const [state, formActionFn, isActionPending] = useActionState(
    async (
      previousState: ActionState<TData>,
      input: TInput
    ): Promise<ActionState<TData>> => {
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

  /**
   * Action function for direct calls (non-form)
   * Properly awaits the action completion to maintain Promise contract
   */
  const action = async (input: TInput): Promise<void> => {
    await formActionFn(input);
  };

  /**
   * Form action function that extracts data from FormData
   * Properly awaits the action completion to maintain Promise contract
   */
  const formAction = async (formData: FormData): Promise<void> => {
    const input = Object.fromEntries(formData as any) as TInput;
    await formActionFn(input);
  };

  return {
    data: state.data,
    error: state.error,
    isPending: isActionPending,
    action,
    formAction,
  };
}

