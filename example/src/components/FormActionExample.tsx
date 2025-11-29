import React from 'react';
import { useApiAction, isReact19OrLater } from 'react-api-weaver';
import { createTodo } from '../generated/todo-api-client';

interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

const FormActionExample: React.FC = () => {
  const { data, error, isPending, formAction } = useApiAction<Todo, { title: string; completed: string }>(
    (input: { title: string; completed: string }) => {
      // Convert form data to API format
      return createTodo({
        userId: 1,
        title: input.title,
        completed: input.completed === 'true',
      });
    },
    {
      onSuccess: (data: Todo) => {
        console.log('Todo created via form action:', data);
      },
    }
  );

  const isReact19 = isReact19OrLater();

  return (
    <div className="example-card">
      <h2>📝 Form Actions {isReact19 ? '(React 19)' : '(React 17/18 Fallback)'}</h2>
      <p>
        {isReact19
          ? "Uses React 19's useActionState for progressive enhancement. Works great with server actions!"
          : "React 19 is not available. This example uses transitions for similar behavior."
        }
      </p>

      <form 
        action={formAction as any}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          formAction(formData);
        }}
      >
        <div className="form-group">
          <label htmlFor="formActionTitle">Todo Title</label>
          <input
            id="formActionTitle"
            name="title"
            type="text"
            placeholder="Enter todo title..."
            required
            disabled={isPending}
          />
        </div>

        <div className="form-group">
          <label htmlFor="formActionCompleted">Status</label>
          <select 
            id="formActionCompleted"
            name="completed" 
            disabled={isPending}
            defaultValue="false"
          >
            <option value="false">Not Completed</option>
            <option value="true">Completed</option>
          </select>
        </div>

        <button 
          className="button" 
          type="submit" 
          disabled={isPending}
        >
          {isPending ? '⏳ Submitting...' : '📤 Submit Form'}
        </button>
      </form>

      {error && (
        <div className="error">
          ❌ Error: {error.message}
        </div>
      )}

      {data && (
        <div className="success-message">
          ✅ Form submitted successfully!
          <div className="data-display">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      )}

      {!isReact19 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
          <strong>💡 Tip:</strong> Upgrade to React 19 to use native useActionState with server actions!
        </div>
      )}
    </div>
  );
};

export default FormActionExample;

