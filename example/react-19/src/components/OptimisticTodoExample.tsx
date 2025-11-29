import React, { useState } from 'react';
import { usePostOptimistic, isReact19OrLater } from 'react-api-weaver';
import { createTodo } from '../generated/todo-api-client';

interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

const OptimisticTodoExample: React.FC = () => {
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);

  const { optimisticData, loading, error, mutate } = usePostOptimistic<Todo, { userId: number; title: string; completed: boolean }>(
    (input: { userId: number; title: string; completed: boolean }) => createTodo(input),
    {
      optimisticUpdate: (_currentData, input: { userId: number; title: string; completed: boolean }) => {
        // Optimistically add the new todo with a temporary ID
        const optimisticTodo: Todo = {
          id: Date.now(), // Temporary ID
          userId: input.userId,
          title: input.title,
          completed: input.completed,
        };
        return optimisticTodo;
      },
      onSuccess: (data: Todo) => {
        // Add the real todo from server to our list
        setTodos((prev) => [...prev, data]);
        setTitle('');
      },
      onError: (err: Error) => {
        console.error('Failed to create todo:', err);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      mutate({
        userId: 1,
        title: title.trim(),
        completed: false,
      });
    }
  };

  const isReact19 = isReact19OrLater();

  return (
    <div className="example-card">
      <h2>✨ Optimistic Updates {isReact19 ? '(React 19)' : '(React 17/18 Fallback)'}</h2>
      <p>
        {isReact19 
          ? "Uses React 19's useOptimistic hook for instant UI feedback. The UI updates immediately before the server responds!"
          : "React 19 is not available. This example will work but without the native useOptimistic hook."
        }
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="optimisticTodoTitle">Todo Title</label>
          <input
            id="optimisticTodoTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo title..."
            disabled={loading}
          />
        </div>

        <button className="button" type="submit" disabled={loading || !title.trim()}>
          {loading ? '⏳ Creating...' : '✨ Create with Optimistic Update'}
        </button>
      </form>

      {error && (
        <div className="error">
          ❌ Error: {error.message}
          <br />
          <small>The optimistic update was rolled back</small>
        </div>
      )}

      {optimisticData && (
        <div className="success-message">
          ⚡ Optimistic todo (shows instantly):
          <div className="data-display">
            <pre>{JSON.stringify(optimisticData, null, 2)}</pre>
          </div>
        </div>
      )}

      {todos.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Created Todos ({todos.length})</h3>
          <div className="data-display">
            {todos.map((todo) => (
              <div key={todo.id} style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                <strong>#{todo.id}</strong>: {todo.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isReact19 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
          <strong>💡 Tip:</strong> Upgrade to React 19 to see native optimistic updates in action!
        </div>
      )}
    </div>
  );
};

export default OptimisticTodoExample;

