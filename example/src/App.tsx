import React from 'react';
import TodoList from './components/TodoList';
import CreateTodo from './components/CreateTodo';
import PollingExample from './components/PollingExample';
import CancelRequestExample from './components/CancelRequestExample';

function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>⚡ React API Weaver</h1>
        <p>Convert OpenAPI specs into typed React hooks with superpowers</p>
      </header>

      <div className="examples-grid">
        <TodoList />
        <CreateTodo />
        <PollingExample />
        <CancelRequestExample />
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
        </ul>
      </div>
    </div>
  );
}

export default App;

