import React from 'react';
import { useGet } from 'react-api-weaver';
import { getTodos } from '../generated/todo-api-client';

const TodoList: React.FC = () => {
  const { data, loading, error, refetch } = useGet(
    () => getTodos({ _limit: 5 }),
    {
      cache: { ttl: 300000 }, // Cache for 5 minutes
      enabled: true,
    }
  );

  return (
    <div className="example-card">
      <h2>📋 Todo List (with Caching)</h2>
      <p>
        Fetches todos from the API with caching enabled. Data is cached for 5 minutes.
      </p>

      <button className="button" onClick={refetch} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </button>

      {loading && <div className="loading">Loading todos...</div>}
      
      {error && <div className="error">Error: {error.message}</div>}

      {data && (
        <div style={{ marginTop: '1rem' }}>
          {data.map((todo) => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                readOnly
              />
              <div className="todo-content">
                <div className="todo-title">{todo.title}</div>
                <div className="todo-id">ID: {todo.id} | User: {todo.userId}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;

