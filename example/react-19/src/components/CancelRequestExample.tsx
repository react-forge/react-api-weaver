import React, { useState } from 'react';
import { useGet } from 'react-api-weaver';
import { getUsers } from '../generated/todo-api-client';

const CancelRequestExample: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [aborted, setAborted] = useState(false);

  const { data, loading, error, refetch, abort } = useGet(
    () => getUsers(),
    {
      enabled,
      onSuccess: () => setAborted(false),
    }
  );

  const startRequest = () => {
    setEnabled(true);
    setAborted(false);
    setTimeout(() => refetch(), 10);
  };

  const cancelRequest = () => {
    abort();
    setAborted(true);
    setEnabled(false);
  };

  return (
    <div className="example-card">
      <h2>🛑 Request Cancellation</h2>
      <p>
        Start a request and cancel it before it completes. Useful for long-running operations.
      </p>

      <div>
        <button
          className="button"
          onClick={startRequest}
          disabled={loading}
        >
          Fetch Users
        </button>
        
        {loading && (
          <button
            className="button button-danger"
            onClick={cancelRequest}
          >
            Cancel Request
          </button>
        )}
      </div>

      {loading && <div className="loading">Loading users...</div>}
      
      {aborted && (
        <div className="error">
          Request was cancelled
        </div>
      )}
      
      {error && !aborted && <div className="error">Error: {error.message}</div>}

      {data && (
        <div className="data-display">
          <strong>Loaded {data.length} users:</strong>
          <pre style={{ marginTop: '0.5rem' }}>
            {JSON.stringify(data.slice(0, 3), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CancelRequestExample;

