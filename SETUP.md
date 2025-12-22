# 🚀 Quick Setup Guide

This guide will help you get started with React API Weaver in under 5 minutes.

## For Users (Installing the Package)

### 1. Install the package

```bash
npm install react-api-weaver
```

### 2. Create your OpenAPI YAML file

Create a file called `api.yaml`:

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

### 3. Generate API code

```bash
npx react-api-weaver generate -i api.yaml -o src/generated
```

### 4. Use in your React app

```tsx
import { useGet } from 'react-api-weaver';
import { getUsers } from './generated/api';

function App() {
  const { data, loading, error } = useGet(() => getUsers());
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 5. Add to your build process (Optional)

In your `package.json`:

```json
{
  "scripts": {
    "predev": "react-api-weaver generate -i api.yaml -o src/generated",
    "dev": "vite"
  }
}
```

## For Contributors (Local Development)

### 1. Clone and install

```bash
git clone <repository-url>
cd react-api-weaver
npm install
```

### 2. Build the library

```bash
npm run build
```

### 3. Link for local testing

```bash
npm link
```

### 4. Try the example app

```bash
cd example
npm install
npm link react-api-weaver
npm run generate
npm run dev
```

Visit `http://localhost:3000` to see the example app.

### 5. Development workflow

**Terminal 1** - Watch library changes:
```bash
# In root directory
npm run dev
```

**Terminal 2** - Run example app:
```bash
# In example directory
npm run dev
```

**Terminal 3** - Watch YAML changes (optional):
```bash
# In example directory
npx react-api-weaver watch -i service-storybook/api.yaml -o src/generated
```

## Common Commands

### Library Commands (from root)

```bash
# Build library
npm run build

# Watch mode (auto-rebuild on changes)
npm run dev

# Link for local development
npm link

# Prepare for publishing
npm run prepublishOnly
```

### Example App Commands (from example/)

```bash
# Generate API code
npm run generate

# Start dev server (also runs generate)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### CLI Commands (after build or install)

```bash
# Generate TypeScript code
react-api-weaver generate -i api.yaml -o src/generated

# Generate JavaScript code
react-api-weaver generate -i api.yaml -o src/generated -f js

# Generate both TS and JS
react-api-weaver generate -i api.yaml -o src/generated -f both

# Watch mode
react-api-weaver watch -i api.yaml -o src/generated

# With custom base URL
react-api-weaver generate -i api.yaml -o src/generated -b https://api.example.com
```

## Troubleshooting

### CLI command not found

After building, the CLI should be available. If not:

```bash
npm run build
npm link
```

### Example app can't find react-api-weaver

Make sure you've linked the package:

```bash
# In root directory
npm link

# In example directory
npm link react-api-weaver
```

### Generated files not updating

1. Delete the generated directory
2. Re-run the generate command
3. Restart your dev server

### TypeScript errors in generated code

Make sure your OpenAPI YAML is valid:

```bash
npx swagger-cli validate api.yaml
```

## Need Help?

- Check the [README](./README.md) for full documentation
- See [CONTRIBUTING](./CONTRIBUTING.md) for development guidelines
- Review the [example app](./example/) for working examples
- Open an issue on GitHub

---

Ready to weave some APIs? 🕸️✨

