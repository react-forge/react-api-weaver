# ⚡ React API Weaver

Convert OpenAPI/Swagger YAML specifications into typed React hooks with caching, polling, and cancellation support.

## 🌟 Features

- **🔄 OpenAPI/Swagger Support**: Convert YAML specs into TypeScript/JavaScript code
- **🎣 React Hooks**: Method-specific hooks (`useGet`, `usePost`, `usePut`, `usePatch`, `useDelete`)
- **💾 Smart Caching**: Built-in response caching with TTL support
- **🔁 Polling**: Auto-refresh data at regular intervals
- **🛑 Request Cancellation**: Abort in-flight requests
- **📘 Full TypeScript Support**: Auto-generated types from OpenAPI schemas
- **🚀 Zero Configuration**: Works out of the box
- **🎯 Type-Safe**: End-to-end type safety from API to UI
- **⚡ Lightweight**: Minimal dependencies, tree-shakeable

## 📦 Installation

```bash
npm install react-api-weaver
```

## 🚀 Quick Start

### 1. Create an OpenAPI YAML file

Create a `api.yaml` file with your API specification:

```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0

servers:
  - url: https://api.example.com

paths:
  /users:
    get:
      operationId: getUsers
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                    name:
                      type: string
```

### 2. Generate API client code

```bash
npx react-api-weaver generate -i api.yaml -o src/generated
```

This generates TypeScript functions and types:
- `src/generated/api.ts` - API functions
- `src/generated/types.ts` - TypeScript types/interfaces for requests and responses
- `src/generated/index.ts` - Exports for easy importing

### 3. Use the generated hooks in your React components

```tsx
import React from 'react';
import { useGet } from 'react-api-weaver';
import { getUsers } from './generated/api';

function UserList() {
  const { data, loading, error, refetch, abort } = useGet(
    () => getUsers(),
    {
      cache: true,
      polling: 30000, // Refresh every 30 seconds
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <button onClick={abort}>Cancel</button>
      {data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## 📖 CLI Usage

### Generate Command

Generate API client code from OpenAPI YAML:

```bash
react-api-weaver generate -i <input.yaml> -o <output-dir> [options]
```

**Options:**
- `-i, --input <path>`: Path to OpenAPI YAML file (required)
- `-o, --output <path>`: Output directory for generated code (required)
- `-f, --format <format>`: Output format: `ts`, `js`, or `both` (default: `ts`)
- `-b, --base-url <url>`: Base URL for API requests

**Example:**

```bash
react-api-weaver generate -i api.yaml -o src/generated -f ts -b https://api.example.com
```

### Watch Command

Watch for changes and regenerate automatically:

```bash
react-api-weaver watch -i <input.yaml> -o <output-dir> [options]
```

**Example:**

```bash
react-api-weaver watch -i api.yaml -o src/generated
```

## 🎣 Hooks API

### useGet

Hook for GET requests with caching support.

```tsx
const { data, loading, error, refetch, abort } = useGet(
  apiFunction,
  options
);
```

### usePost

Hook for POST requests (cache disabled by default).

```tsx
const { data, loading, error, refetch, abort } = usePost(
  apiFunction,
  options
);
```

### usePut

Hook for PUT requests (cache disabled by default).

```tsx
const { data, loading, error, refetch, abort } = usePut(
  apiFunction,
  options
);
```

### usePatch

Hook for PATCH requests (cache disabled by default).

```tsx
const { data, loading, error, refetch, abort } = usePatch(
  apiFunction,
  options
);
```

### useDelete

Hook for DELETE requests (cache disabled by default).

```tsx
const { data, loading, error, refetch, abort } = useDelete(
  apiFunction,
  options
);
```

## ⚙️ Hook Options

All hooks accept an options object:

```typescript
interface UseApiOptions<TData> {
  // Enable/disable caching (default: true for GET, false for others)
  cache?: boolean | {
    ttl?: number;  // Time to live in milliseconds
    key?: string;  // Custom cache key
  };

  // Polling interval in milliseconds
  polling?: number;

  // Whether the request should be executed (default: true)
  enabled?: boolean;

  // Success callback
  onSuccess?: (data: TData) => void;

  // Error callback
  onError?: (error: Error) => void;

  // Number of retries or boolean (default: 0)
  retry?: number | boolean;

  // Delay between retries in milliseconds (default: 1000)
  retryDelay?: number;
}
```

## 🎯 Return Values

All hooks return an object with:

```typescript
interface UseApiResult<TData> {
  // Response data
  data: TData | null;

  // Loading state
  loading: boolean;

  // Error object
  error: Error | null;

  // Manual refetch function
  refetch: () => Promise<void>;

  // Abort current request
  abort: () => void;
}
```

## 💡 Examples

### Example 1: Basic GET with Caching

```tsx
import { useGet } from 'react-api-weaver';
import { getTodos } from './generated/api';

function TodoList() {
  const { data, loading } = useGet(
    () => getTodos({ _limit: 10 }),
    { cache: { ttl: 300000 } } // Cache for 5 minutes
  );

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.map(todo => <li key={todo.id}>{todo.title}</li>)}
    </ul>
  );
}
```

### Example 2: POST with Success Callback

```tsx
import { usePost } from 'react-api-weaver';
import { createTodo } from './generated/api';

function CreateTodo() {
  const [title, setTitle] = useState('');

  const { loading, refetch } = usePost(
    () => createTodo({}, { title, userId: 1, completed: false }),
    {
      enabled: false,
      onSuccess: (data) => {
        console.log('Todo created:', data);
        setTitle('');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    refetch();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button disabled={loading}>Create</button>
    </form>
  );
}
```

### Example 3: Polling

```tsx
import { useGet } from 'react-api-weaver';
import { getTodoById } from './generated/api';

function LiveTodo({ id }) {
  const { data } = useGet(
    () => getTodoById({ id }),
    { polling: 5000 } // Poll every 5 seconds
  );

  return <div>{data?.title}</div>;
}
```

### Example 4: Request Cancellation

```tsx
import { useGet } from 'react-api-weaver';
import { getUsers } from './generated/api';

function UserList() {
  const { data, loading, abort } = useGet(() => getUsers());

  return (
    <div>
      {loading && <button onClick={abort}>Cancel</button>}
      {data && <div>{data.length} users loaded</div>}
    </div>
  );
}
```

### Example 5: Conditional Requests

```tsx
import { useGet } from 'react-api-weaver';
import { getUserById } from './generated/api';

function UserProfile({ userId }) {
  const { data } = useGet(
    () => getUserById({ id: userId }),
    { enabled: !!userId } // Only fetch when userId is available
  );

  return <div>{data?.name}</div>;
}
```

## 🔧 Configuration

### Custom Request Configuration

The generated API functions accept a `RequestConfig` parameter:

```typescript
interface RequestConfig {
  headers?: Record<string, string>;
  baseURL?: string;
  timeout?: number;
  signal?: AbortSignal;
}
```

**Example:**

```tsx
const { data } = useGet(
  () => getUsers({}, {
    headers: { 'Authorization': 'Bearer token' },
    timeout: 5000,
  })
);
```

### Setting Default Base URL

You can set a base URL in three ways:

1. **In the OpenAPI YAML** (servers section)
2. **Via CLI**: `react-api-weaver generate -i api.yaml -o src/generated -b https://api.example.com`
3. **At runtime**: Pass `baseURL` in the request config

## 📁 Project Structure

```
your-project/
├── src/
│   ├── generated/          # Generated API code
│   │   ├── api.ts          # Generated API functions
│   │   ├── types.ts        # TypeScript types/interfaces
│   │   └── index.ts        # Exports (functions + types)
│   └── components/
│       └── UserList.tsx    # Your components using hooks
├── api.yaml                # OpenAPI specification
└── package.json
```

## 📘 Type Exports

All TypeScript types are exported from the generated `types.ts` file. You can import types separately from functions:

```tsx
// Import functions
import { getUsers, createUser } from './generated/api';

// Import types separately
import type { GetUsersResponse, CreateUserBody, CreateUserResponse } from './generated/types';

// Or import everything from index
import { getUsers, type GetUsersResponse } from './generated';
```

**Available Types:**
- `{OperationName}Params` - Request parameters (for GET, DELETE, etc.)
- `{OperationName}Body` - Request body (for POST, PUT, PATCH)
- `{OperationName}Response` - Response data type

**Example:**
```tsx
import { getTodoById } from './generated/api';
import type { GetTodoByIdParams, GetTodoByIdResponse } from './generated/types';

function TodoComponent({ todoId }: { todoId: number }) {
  const params: GetTodoByIdParams = { id: todoId };
  const { data } = useGet<GetTodoByIdResponse>(
    () => getTodoById(params)
  );
  
  return <div>{data?.title}</div>;
}
```

## 🛠️ Development Workflow

### Option 1: Manual Generation

```json
{
  "scripts": {
    "generate": "react-api-weaver generate -i api.yaml -o src/generated"
  }
}
```

Run `npm run generate` when you update your API spec.

### Option 2: Pre-development Generation

```json
{
  "scripts": {
    "predev": "react-api-weaver generate -i api.yaml -o src/generated",
    "dev": "vite"
  }
}
```

Automatically generates code before starting the dev server.

### Option 3: Watch Mode (Separate Terminal)

```bash
react-api-weaver watch -i api.yaml -o src/generated
```

Automatically regenerates code when the YAML file changes.

## 🧪 Testing with npm link

For local development and testing:

```bash
# In react-api-weaver directory
npm run build
npm link

# In your project directory
npm link react-api-weaver
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [TypeScript](https://www.typescriptlang.org/)
- Powered by [React](https://reactjs.org/)
- OpenAPI parsing by [Swagger Parser](https://github.com/APIDevTools/swagger-parser)
- Bundled with [tsup](https://github.com/egoist/tsup)

## 📚 Related Projects

- [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator)
- [React Query](https://tanstack.com/query/latest)
- [SWR](https://swr.vercel.app/)

## ☕ Support

If you find this project helpful, consider supporting me by buying me a coffee!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/ajay28kumar)

---

Made with ❤️ by the React API Weaver team

