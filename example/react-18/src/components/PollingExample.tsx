import React, { useState } from 'react';
import { useGet } from 'react-api-weaver';
import { getTodoById } from '../generated/todo-api-client';

const PollingExample: React.FC = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  const randomId = Math.floor(Math.random() * 20) + 1;

  const { data, loading, error, abort } = useGet(
    () => getTodoById({ id: randomId }),
    {
      polling: isPolling ? 10000 : undefined, // Poll every 10 seconds
      enabled: isPolling,
      onSuccess: () => setFetchCount((prev) => prev + 1),
    }
  );

  const startPolling = () => {
    setIsPolling(true);
    setFetchCount(0);
  };

  const stopPolling = () => {
    setIsPolling(false);
    abort();
  };

  return (
    <div className="example-card">
      <h2>🔄 Polling Example</h2>
      <p>
        Auto-refreshes data every 10 seconds. Watch the fetch count increase!
        <span className="badge">{fetchCount} fetches</span>
      </p>

      <div>
        {!isPolling ? (
          <button className="button" onClick={startPolling}>
            Start Polling
          </button>
        ) : (
          <button className="button button-danger" onClick={stopPolling}>
            Stop Polling
          </button>
        )}
      </div>

      {loading && <div className="loading">Loading...</div>}
      
      {error && <div className="error">Error: {error.message}</div>}

      {data && (
        <div className="todo-item" style={{ marginTop: '1rem' }}>
          <input
            type="checkbox"
            checked={data.completed}
            readOnly
          />
          <div className="todo-content">
            <div className="todo-title">{data.title}</div>
            <div className="todo-id">ID: {data.id} | User: {data.userId}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollingExample;

