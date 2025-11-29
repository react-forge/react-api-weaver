import React, { useState } from 'react';
import { usePost } from 'react-api-weaver';
import { createTodo } from '../generated/todo-api-client';

const CreateTodo: React.FC = () => {
  const [title, setTitle] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { data, loading, error, refetch } = usePost(
    () => createTodo({ userId: 1, title, completed: false }),
    {
      enabled: false, // Don't execute on mount
      onSuccess: () => {
        setShowSuccess(true);
        setTitle('');
        setTimeout(() => setShowSuccess(false), 3000);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      refetch();
    }
  };

  return (
    <div className="example-card">
      <h2>➕ Create Todo (POST Request)</h2>
      <p>
        Demonstrates POST requests without caching. Shows success state after creation.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="todoTitle">Todo Title</label>
          <input
            id="todoTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo title..."
            disabled={loading}
          />
        </div>

        <button className="button" type="submit" disabled={loading || !title.trim()}>
          {loading ? 'Creating...' : 'Create Todo'}
        </button>
      </form>

      {error && <div className="error">Error: {error.message}</div>}

      {showSuccess && (
        <div className="success-message">
          ✅ Todo created successfully!
        </div>
      )}

      {data && (
        <div className="data-display">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CreateTodo;

