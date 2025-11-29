# React API Weaver - Example App (React 19)

This is a demo application showcasing all features of React API Weaver with **React 19**.

## 🚀 Quick Start

1. **Install dependencies**

```bash
npm install
```

2. **Generate API code from OpenAPI spec**

```bash
npm run generate
```

This generates TypeScript code in `src/generated/` from the `service-storybook/api.yaml` file.

3. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📋 What's Included

This example demonstrates:

### 1. TodoList Component
- **GET requests** with caching enabled
- Cache TTL of 5 minutes
- Manual refetch functionality
- Displays first 5 todos

### 2. CreateTodo Component
- **POST requests** for creating new todos
- Success callbacks
- Form handling
- Disabled caching (default for mutations)

### 3. PollingExample Component
- **Automatic polling** every 10 seconds
- Start/stop polling controls
- Fetch count tracking
- Real-time data updates

### 4. CancelRequestExample Component
- **Request cancellation** using abort()
- Manual request triggering
- Loading state management
- Abort signal handling

## 🔧 Development

### Generate API Code

The example uses a sample OpenAPI specification located at `service-storybook/api.yaml`. This spec describes a Todo API based on JSONPlaceholder.

To regenerate the API client code:

```bash
npm run generate
```

This creates:
- `src/generated/api.ts` - TypeScript functions and interfaces
- `src/generated/index.ts` - Re-exports for easy importing

### Watch Mode

To automatically regenerate code when the YAML file changes:

```bash
npx react-api-weaver watch -i service-storybook/api.yaml -o src/generated
```

### Project Structure

```
example/
├── service-storybook/
│   └── api.yaml              # OpenAPI specification
├── src/
│   ├── components/
│   │   ├── TodoList.tsx      # GET with caching
│   │   ├── CreateTodo.tsx    # POST requests
│   │   ├── PollingExample.tsx    # Polling demo
│   │   └── CancelRequestExample.tsx  # Abort demo
│   ├── generated/            # Generated API code (auto-generated)
│   │   ├── api.ts
│   │   └── index.ts
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Styles
├── index.html
├── vite.config.ts
└── package.json
```

## 📖 Key Concepts

### Generated API Functions

The code generator creates typed functions from your OpenAPI spec:

```typescript
// Generated from the OpenAPI YAML
export interface GetTodosParams {
  _limit?: number;
  _page?: number;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export async function getTodos(
  params: GetTodosParams,
  config?: RequestConfig
): Promise<Todo[]>
```

### Using with Hooks

Import and use the generated functions with React API Weaver hooks:

```typescript
import { useGet } from 'react-api-weaver';
import { getTodos } from './generated/api';

function MyComponent() {
  const { data, loading, error } = useGet(
    () => getTodos({ _limit: 5 }),
    { cache: true }
  );
  
  // ... component logic
}
```

## 🎨 Customization

### Modify the OpenAPI Spec

Edit `service-storybook/api.yaml` to add new endpoints:

```yaml
paths:
  /my-endpoint:
    get:
      operationId: getMyData
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
```

Then regenerate:

```bash
npm run generate
```

### Add Custom Headers

Pass headers via the config parameter:

```typescript
const { data } = useGet(
  () => getTodos({}, {
    headers: { 'Authorization': 'Bearer token' }
  })
);
```

### Change Base URL

Update in three ways:

1. **OpenAPI YAML** - Change the `servers[0].url`
2. **CLI** - `react-api-weaver generate -i api.yaml -o src/generated -b https://new-url.com`
3. **Runtime** - Pass `baseURL` in the config

## 🔗 API Used

This example uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/), a free fake REST API for testing and prototyping.

## 📚 Learn More

- [React API Weaver Documentation](../README.md)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## 💡 Tips

1. **Caching**: Enable caching for GET requests to reduce API calls
2. **Polling**: Use sparingly to avoid overwhelming the API
3. **Error Handling**: Always handle error states in your UI
4. **Type Safety**: Leverage TypeScript for better developer experience
5. **Request Cancellation**: Clean up requests when components unmount

## 🐛 Troubleshooting

### Generated code not found?

Run `npm run generate` to create the generated API code.

### Type errors after regenerating?

Restart your TypeScript server in your editor.

### CORS errors?

The example uses JSONPlaceholder which allows CORS. For your own API, ensure CORS is properly configured on the server.

---

Happy coding! 🚀

