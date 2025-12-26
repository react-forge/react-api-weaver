<div align="center">

# React API Weaver

[![npm version](https://img.shields.io/npm/v/react-api-weaver.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/react-api-weaver)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-17%20%7C%2018%20%7C%2019-61DAFB.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![npm downloads](https://img.shields.io/npm/dm/react-api-weaver.svg?style=flat-square)](https://www.npmjs.com/package/react-api-weaver)

**Transform OpenAPI/Swagger specs into type-safe React hooks with superpowers**

[Installation](#-installation) •
[Quick Start](#-quick-start) •
[Documentation](#-documentation) •
[Examples](#-examples) •
[React 19 Support](#-react-19-features)

</div>

---

## 🌟 Features

<table>
<tr>
<td width="50%" valign="top">

### 🎯 Core Features
- **🔄 OpenAPI/Swagger Support** - Convert YAML specs into TypeScript/JavaScript
- **🎣 Method-Specific Hooks** - `useGet`, `usePost`, `usePut`, `usePatch`, `useDelete`
- **💾 Smart Caching** - Built-in response caching with TTL support
- **🔁 Auto-Polling** - Refresh data at regular intervals
- **🛑 Request Cancellation** - Abort in-flight requests
- **🚀 Zero Configuration** - Works out of the box

</td>
<td width="50%" valign="top">

### ⚡ Advanced Features
- **📘 Full TypeScript Support** - Auto-generated types from schemas
- **🎯 Type-Safe** - End-to-end type safety from API to UI
- **🪶 Lightweight** - Minimal dependencies, tree-shakeable
- **✨ React 19 Ready** - Optimistic updates & form actions
- **🔄 Backward Compatible** - Supports React 17, 18, and 19
- **🎨 Developer Friendly** - Intuitive API and great DX

</td>
</tr>
</table>

---

## 📦 Installation

```bash
npm install react-api-weaver
```

## Test Coverage

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 85.27% | ✅ |
| Branches | 83.06% | ⚠️ |
| Functions | 90.16% | ✅ |
| Lines | 85.27% | ✅ |

*Last Updated: 2025-12-26*

**Requirements:**
- React 17, 18, or 19
- TypeScript 4.5+ (optional but recommended)
- Node.js 16+

---

## 🚀 Quick Start

### Step 1️⃣: Create an OpenAPI Specification

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

### Step 2️⃣: Generate Type-Safe API Client

```bash
npx react-api-weaver generate -i api.yaml -o src/generated
```

**Generated files:**
- 📄 `src/generated/api.ts` - API functions
- 📄 `src/generated/types.ts` - TypeScript types/interfaces
- 📄 `src/generated/index.ts` - Barrel exports

### Step 3️⃣: Use in Your React Components

```tsx
import React from 'react';
import { useGet } from 'react-api-weaver';
import { getUsers } from './generated/api';

function UserList() {
  const { data, loading, error, refetch, abort } = useGet(
    () => getUsers(),
    {
      cache: true,
      polling: 30000, // Auto-refresh every 30 seconds
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refetch}>🔄 Refresh</button>
      <button onClick={abort}>❌ Cancel</button>
      {data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

---

## 📊 Test Coverage

<table>
<tr>
<th>Metric</th>
<th>Coverage</th>
<th>Status</th>
</tr>
<tr>
<td>Statements</td>
<td><code>85.27%</code></td>
<td>✅ Excellent</td>
</tr>
<tr>
<td>Branches</td>
<td><code>83.46%</code></td>
<td>⚠️ Good</td>
</tr>
<tr>
<td>Functions</td>
<td><code>90.16%</code></td>
<td>✅ Excellent</td>
</tr>
<tr>
<td>Lines</td>
<td><code>85.27%</code></td>
<td>✅ Excellent</td>
</tr>
</table>

*Last Updated: December 23, 2025*

---

## 📖 CLI Documentation

### Generate Command

Generate API client code from OpenAPI specifications:

```bash
react-api-weaver generate -i <input.yaml> -o <output-dir> [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --input <path>` | Path to OpenAPI YAML file | Required |
| `-o, --output <path>` | Output directory for generated code | Required |
| `-f, --format <format>` | Output format: `ts`, `js`, or `both` | `ts` |
| `-b, --base-url <url>` | Base URL for API requests | From YAML |

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

---

## 🎣 Hooks API Reference

### Standard HTTP Method Hooks

<table>
<tr>
<th>Hook</th>
<th>HTTP Method</th>
<th>Default Cache</th>
<th>Use Case</th>
</tr>
<tr>
<td><code>useGet</code></td>
<td>GET</td>
<td>✅ Enabled</td>
<td>Fetch data</td>
</tr>
<tr>
<td><code>usePost</code></td>
<td>POST</td>
<td>❌ Disabled</td>
<td>Create resources</td>
</tr>
<tr>
<td><code>usePut</code></td>
<td>PUT</td>
<td>❌ Disabled</td>
<td>Replace resources</td>
</tr>
<tr>
<td><code>usePatch</code></td>
<td>PATCH</td>
<td>❌ Disabled</td>
<td>Update resources</td>
</tr>
<tr>
<td><code>useDelete</code></td>
<td>DELETE</td>
<td>❌ Disabled</td>
<td>Remove resources</td>
</tr>
</table>

#### Basic Usage

```tsx
const { data, loading, error, refetch, abort } = useGet(
  apiFunction,
  options
);
```

### React 19+ Enhanced Hooks

#### Optimistic Update Hooks

Perfect for instant UI feedback with automatic rollback on errors:

- `useApiOptimistic` - Generic optimistic mutations
- `usePostOptimistic` - POST with optimistic updates
- `usePutOptimistic` - PUT with optimistic updates
- `usePatchOptimistic` - PATCH with optimistic updates
- `useDeleteOptimistic` - DELETE with optimistic updates

```tsx
const { data, optimisticData, loading, error, mutate, abort } = usePostOptimistic(
  apiFunction,
  {
    optimisticUpdate: (currentData, input) => {
      // Return the optimistic state
      return { ...currentData, ...input };
    },
    onSuccess: (data) => console.log('Success!', data),
  }
);
```

#### Form Action Hook

Seamlessly integrate with native forms using React 19's `useActionState`:

```tsx
const { data, error, isPending, action, formAction } = useApiAction(
  apiFunction,
  {
    onSuccess: (data) => console.log('Success!', data),
  }
);

// Use with forms
<form action={formAction}>
  <input name="title" />
  <button type="submit">Submit</button>
</form>

// Or call directly
await action({ title: 'New Todo' });
```

---

## ⚙️ Configuration Options

### Hook Options

All hooks accept a comprehensive options object:

```typescript
interface UseApiOptions<TData> {
  // Caching configuration
  cache?: boolean | {
    ttl?: number;       // Time to live in milliseconds
    key?: string;       // Custom cache key
  };

  // Polling interval in milliseconds
  polling?: number;

  // Conditional execution (default: true)
  enabled?: boolean;

  // Lifecycle callbacks
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;

  // Retry configuration
  retry?: number | boolean;    // Number of retries or boolean (default: 0)
  retryDelay?: number;         // Delay between retries in ms (default: 1000)
}
```

### Request Configuration

Customize individual API requests:

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

### Return Values

All hooks return a consistent interface:

```typescript
interface UseApiResult<TData> {
  data: TData | null;           // Response data
  loading: boolean;             // Loading state
  error: Error | null;          // Error object
  refetch: () => Promise<void>; // Manual refetch
  abort: () => void;            // Cancel request
}
```

---

## 💡 Examples

### Example 1: Basic GET with Smart Caching

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
import { useState } from 'react';

function CreateTodo() {
  const [title, setTitle] = useState('');

  const { loading, refetch } = usePost(
    () => createTodo({}, { title, userId: 1, completed: false }),
    {
      enabled: false,
      onSuccess: (data) => {
        console.log('✅ Todo created:', data);
        setTitle('');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter todo title..."
      />
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Example 3: Auto-Polling for Real-Time Updates

```tsx
import { useGet } from 'react-api-weaver';
import { getTodoById } from './generated/api';

function LiveTodo({ id }: { id: number }) {
  const { data } = useGet(
    () => getTodoById({ id }),
    { polling: 5000 } // Poll every 5 seconds
  );

  return <div>📝 {data?.title}</div>;
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
      {loading && (
        <button onClick={abort}>❌ Cancel Request</button>
      )}
      {data && <div>✅ {data.length} users loaded</div>}
    </div>
  );
}
```

### Example 5: Conditional Requests

```tsx
import { useGet } from 'react-api-weaver';
import { getUserById } from './generated/api';

function UserProfile({ userId }: { userId?: number }) {
  const { data } = useGet(
    () => getUserById({ id: userId! }),
    { enabled: !!userId } // Only fetch when userId is available
  );

  return <div>{data?.name ?? 'No user selected'}</div>;
}
```

### Example 6: Optimistic Updates (React 19+)

```tsx
import { usePostOptimistic } from 'react-api-weaver';
import { createTodo } from './generated/api';
import { useState } from 'react';

function OptimisticTodo() {
  const [todos, setTodos] = useState([]);
  
  const { optimisticData, loading, mutate } = usePostOptimistic(
    (input) => createTodo(input),
    {
      optimisticUpdate: (current, input) => ({
        id: Date.now(), // Temporary ID
        ...input,
      }),
      onSuccess: (data) => {
        setTodos(prev => [...prev, data]);
      },
    }
  );

  const handleCreate = () => {
    mutate({ title: 'New Todo', userId: 1, completed: false });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={loading}>
        ➕ Add Todo
      </button>
      {optimisticData && (
        <div style={{ opacity: loading ? 0.5 : 1 }}>
          ⚡ {optimisticData.title} (optimistic)
        </div>
      )}
      {todos.map(todo => (
        <div key={todo.id}>✅ {todo.title}</div>
      ))}
    </div>
  );
}
```

### Example 7: Form Actions (React 19+)

```tsx
import { useApiAction } from 'react-api-weaver';
import { createTodo } from './generated/api';

function TodoForm() {
  const { data, error, isPending, formAction } = useApiAction(
    (input: any) => createTodo({
      userId: 1,
      title: input.title,
      completed: input.completed === 'true',
    })
  );

  return (
    <form action={formAction}>
      <input name="title" placeholder="Todo title" required />
      <select name="completed">
        <option value="false">Not Done</option>
        <option value="true">Done</option>
      </select>
      <button type="submit" disabled={isPending}>
        {isPending ? '⏳ Creating...' : '✨ Create Todo'}
      </button>
      {error && <div style={{ color: 'red' }}>❌ {error.message}</div>}
      {data && <div style={{ color: 'green' }}>✅ Created: {data.title}</div>}
    </form>
  );
}
```

---

## 📘 TypeScript Support

### Type Exports

All TypeScript types are automatically generated and exported:

```tsx
// Import functions
import { getUsers, createUser } from './generated/api';

// Import types separately
import type { 
  GetUsersResponse, 
  CreateUserBody, 
  CreateUserResponse 
} from './generated/types';

// Or import everything from index
import { getUsers, type GetUsersResponse } from './generated';
```

### Type Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Request Parameters | `{OperationName}Params` | `GetUserByIdParams` |
| Request Body | `{OperationName}Body` | `CreateUserBody` |
| Response Data | `{OperationName}Response` | `GetUsersResponse` |

### Type-Safe Example

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

---

## 🛠️ Development Workflow

### Option 1: Manual Generation

Add a script to your `package.json`:

```json
{
  "scripts": {
    "generate": "react-api-weaver generate -i api.yaml -o src/generated"
  }
}
```

Run `npm run generate` when you update your API spec.

### Option 2: Pre-development Generation

Automatically generate before starting dev server:

```json
{
  "scripts": {
    "predev": "react-api-weaver generate -i api.yaml -o src/generated",
    "dev": "vite"
  }
}
```

### Option 3: Watch Mode (Recommended)

Run in a separate terminal for automatic regeneration:

```bash
react-api-weaver watch -i api.yaml -o src/generated
```

---

## 🎉 React 19 Features

React API Weaver fully supports React 19 while maintaining **100% backward compatibility** with React 17 and 18.

### What's New in React 19 Support

<table>
<tr>
<td width="50%">

#### ⚡ Optimistic Updates

Instant UI feedback using React 19's `useOptimistic`:

```tsx
import { usePostOptimistic } from 'react-api-weaver';

const { optimisticData, mutate } = usePostOptimistic(
  createTodo,
  {
    optimisticUpdate: (current, input) => ({
      id: Date.now(),
      ...input,
    }),
  }
);
```

**Benefits:**
- ⚡ Instant UI updates
- 🔄 Automatic rollback on errors
- 🎯 Type-safe optimistic state

</td>
<td width="50%">

#### 📝 Form Actions

Progressive enhancement with `useActionState`:

```tsx
import { useApiAction } from 'react-api-weaver';

const { formAction, isPending } = useApiAction(createTodo);

<form action={formAction}>
  <input name="title" />
  <button disabled={isPending}>Submit</button>
</form>
```

**Benefits:**
- 📝 Works with native forms
- 🚀 Progressive enhancement
- 🎯 Built-in pending states

</td>
</tr>
</table>

### Backward Compatibility Matrix

| Feature | React 19 | React 17/18 Fallback |
|---------|----------|----------------------|
| `useApiOptimistic` | Native `useOptimistic` | Manual state management |
| `useApiAction` | Native `useActionState` | `useTransition` + state |
| Optimistic hooks | Native rollback | Manual error handling |
| All standard hooks | ✅ Supported | ✅ Supported |

### Version Detection Utilities

```tsx
import { isReact19OrLater, getReactMajorVersion } from 'react-api-weaver';

if (isReact19OrLater()) {
  console.log('🎉 React 19 features available!');
}

console.log(`React version: ${getReactMajorVersion()}`);
```

### Best Practices

#### ✅ When to Use Optimistic Updates

- Creating new items in a list
- Toggling boolean states (like/unlike, follow/unfollow)
- Updating text fields or simple data
- Deleting items with immediate visual feedback

#### ❌ When to Avoid Optimistic Updates

- Complex server-side validation scenarios
- Operations with unpredictable side effects
- Critical financial transactions
- Cases where server response differs significantly from input

#### ✅ When to Use Form Actions

- Traditional form submissions
- Server-side validation workflows
- Progressive enhancement requirements
- Multi-step forms

---

## 🔧 Advanced Configuration

### Setting Base URL

Configure your API base URL in three ways:

**1. In OpenAPI YAML (servers section):**

```yaml
servers:
  - url: https://api.example.com
```

**2. Via CLI:**

```bash
react-api-weaver generate -i api.yaml -o src/generated -b https://api.example.com
```

**3. At Runtime:**

```tsx
const { data } = useGet(
  () => getUsers({}, { baseURL: 'https://api.example.com' })
);
```

### Custom Headers & Authentication

```tsx
const { data } = useGet(
  () => getUsers({}, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Custom-Header': 'value',
    },
  })
);
```

### Retry Configuration

```tsx
const { data } = useGet(
  () => getUsers(),
  {
    retry: 3,           // Retry 3 times on failure
    retryDelay: 2000,   // Wait 2 seconds between retries
  }
);
```

---

## 📁 Project Structure

```
your-project/
├── src/
│   ├── generated/              # ✨ Generated API code
│   │   ├── api.ts              #    API functions
│   │   ├── types.ts            #    TypeScript types
│   │   └── index.ts            #    Barrel exports
│   ├── components/
│   │   └── UserList.tsx        # Your components
│   └── App.tsx
├── api.yaml                    # 📋 OpenAPI specification
├── package.json
└── tsconfig.json
```

---

## 🧪 Testing with npm link

For local development and testing:

```bash
# In react-api-weaver directory
npm run build
npm link

# In your project directory
npm link react-api-weaver
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

### Development Setup

```bash
git clone https://github.com/react-forge/react-api-weaver.git
cd react-api-weaver
npm install
npm run build
npm test
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔮 Roadmap

### Implemented ✅
- [x] Full TypeScript support with auto-generated types
- [x] Method-specific React hooks
- [x] Smart caching with TTL
- [x] Request polling and cancellation
- [x] React 19 optimistic updates
- [x] React 19 form actions
- [x] Comprehensive test suite (85%+ coverage)

### Coming Soon 🚀
- [ ] React Query integration
- [ ] Request/response middleware (interceptors)
- [ ] WebSocket support
- [ ] GraphQL support
- [ ] Zod schema validation
- [ ] DevTools integration
- [ ] Interactive documentation playground

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- ⚛️ [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- 📘 [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- 📋 [Swagger Parser](https://github.com/APIDevTools/swagger-parser) - OpenAPI parsing and validation
- 📦 [tsdown](https://tsdown.dev) - Modern TypeScript bundler

---

## ☕ Support

If you find this project helpful, consider supporting the development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/ajay28kumar)

---

## 📚 Documentation & Resources

- 📖 [API Reference](https://github.com/react-forge/react-api-weaver)
- 🎓 [Examples Repository](https://github.com/react-forge/react-api-weaver/tree/main/example)
- 🐛 [Issue Tracker](https://github.com/react-forge/react-api-weaver/issues)
- 💬 [Discussions](https://github.com/react-forge/react-api-weaver/discussions)

---

<div align="center">

**Made with ❤️ by react-forge**

⭐ Star us on [GitHub](https://github.com/react-forge/react-api-weaver) if you find this useful!

</div>
