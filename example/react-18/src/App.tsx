import TodoList from './components/TodoList';
import CreateTodo from './components/CreateTodo';
import PollingExample from './components/PollingExample';
import CancelRequestExample from './components/CancelRequestExample';
import OptimisticTodoExample from './components/OptimisticTodoExample';
import FormActionExample from './components/FormActionExample';
import { isReact19OrLater } from 'react-api-weaver';

function App() {
  const isReact19 = isReact19OrLater();

  return (
    <div className="container">
      <header className="header">
        <h1>⚡ React API Weaver</h1>
        <p>Convert OpenAPI specs into typed React hooks with superpowers</p>
        {isReact19 && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            background: '#d4edda', 
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            🎉 <strong>React 19 Detected!</strong> You can use the new optimistic updates and form actions features.
          </div>
        )}
      </header>

      <div className="examples-grid">
        <TodoList />
        <CreateTodo />
        <PollingExample />
        <CancelRequestExample />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          ✨ React 19 Features {!isReact19 && '(with React 17/18 Fallback)'}
        </h2>
        <div className="examples-grid">
          <OptimisticTodoExample />
          <FormActionExample />
        </div>
      </div>

      <div className="example-card" style={{ marginTop: '2rem' }}>
        <h2>🎯 Features Demonstrated</h2>
        <ul style={{ lineHeight: '2', color: '#666' }}>
          <li>✅ <strong>GET with Caching:</strong> TodoList caches data for 5 minutes</li>
          <li>✅ <strong>POST Requests:</strong> Create new todos</li>
          <li>✅ <strong>Polling:</strong> Auto-refresh data every 10 seconds</li>
          <li>✅ <strong>Request Cancellation:</strong> Abort long-running requests</li>
          <li>✅ <strong>Type Safety:</strong> Full TypeScript support from OpenAPI schema</li>
          <li>✅ <strong>Error Handling:</strong> Graceful error states</li>
          {isReact19 && (
            <>
              <li>✨ <strong>Optimistic Updates (React 19):</strong> Instant UI feedback with automatic rollback</li>
              <li>✨ <strong>Form Actions (React 19):</strong> Progressive enhancement with useActionState</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;

