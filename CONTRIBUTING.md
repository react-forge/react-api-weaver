# Contributing to React API Weaver

Thank you for your interest in contributing to React API Weaver! This document provides guidelines and instructions for setting up the development environment and contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Getting Started

1. **Clone the repository**

```bash
git clone <repository-url>
cd react-api-weaver
```

2. **Install dependencies**

```bash
npm install
```

3. **Build the library**

```bash
npm run build
```

4. **Link for local development**

```bash
npm link
```

## Testing with the Example App

The `example/` directory contains a fully functional React application demonstrating all features of React API Weaver.

### Setup Example App

1. **Navigate to example directory**

```bash
cd example
```

2. **Install dependencies**

```bash
npm install
```

3. **Link the local library**

```bash
npm link react-api-weaver
```

4. **Generate API code from OpenAPI spec**

```bash
npm run generate
```

This will generate TypeScript code in `example/src/generated/` from the `example/service-storybook/api.yaml` file.

5. **Start the development server**

```bash
npm run dev
```

The example app will be available at `http://localhost:3000`.

### Example App Features

The example demonstrates:
- **TodoList**: GET requests with caching (5-minute TTL)
- **CreateTodo**: POST requests with success callbacks
- **PollingExample**: Auto-refresh data every 10 seconds
- **CancelRequestExample**: Abort in-flight requests

## Project Structure

```
react-api-weaver/
├── src/
│   ├── hooks/          # React hooks (useGet, usePost, etc.)
│   ├── core/           # Core utilities (cache, polling, request)
│   ├── generator/      # OpenAPI parser and code generator
│   ├── cli/            # CLI tool
│   ├── types/          # TypeScript type definitions
│   └── index.ts        # Main entry point
├── example/
│   ├── service-storybook/  # OpenAPI YAML files
│   ├── src/
│   │   ├── components/     # React demo components
│   │   └── generated/      # Generated API code (gitignored)
│   └── package.json
├── tsup.config.ts      # Build configuration
└── package.json
```

## Development Workflow

### 1. Making Changes to the Library

When you modify the library source code:

```bash
# Build the library
npm run build

# Or use watch mode
npm run dev
```

The example app will automatically pick up changes since it's linked.

### 2. Testing CLI Changes

To test CLI tool changes:

```bash
# Build first
npm run build

# Test CLI commands
react-api-weaver generate -i example/service-storybook/api.yaml -o example/src/generated

# Or test watch mode
react-api-weaver watch -i example/service-storybook/api.yaml -o example/src/generated
```

### 3. Testing Hook Changes

Make changes to hooks in `src/hooks/`, build the library, and the example app will reflect the changes.

### 4. Updating the Generator

If you modify the OpenAPI parser or code generator:

1. Make changes in `src/generator/`
2. Build the library: `npm run build`
3. Regenerate example code: `cd example && npm run generate`
4. Test in the example app: `npm run dev`

## Code Style

- Use TypeScript for all source files
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Keep functions focused and single-purpose
- Use meaningful variable and function names

## Adding New Features

### Adding a New Hook

1. Create a new file in `src/hooks/` (e.g., `useCustom.ts`)
2. Implement using the base `useApi` hook
3. Export from `src/index.ts`
4. Update TypeScript types if needed
5. Add documentation to README.md
6. Create an example in the example app

### Adding CLI Commands

1. Add command in `src/cli/index.ts`
2. Implement the command logic
3. Build and test
4. Update README with new command documentation

### Extending the Generator

1. Modify `src/generator/parser.ts` for parsing changes
2. Modify `src/generator/codegen.ts` for generation changes
3. Update `src/generator/types.ts` if adding new types
4. Test with various OpenAPI specs

## Testing

Currently, the project uses manual testing with the example app. Contributions to add automated testing are welcome!

### Manual Testing Checklist

- [ ] CLI generate command works
- [ ] CLI watch command works
- [ ] Generated TypeScript code compiles
- [ ] useGet hook works with caching
- [ ] usePost/usePut/usePatch/useDelete hooks work
- [ ] Polling functionality works
- [ ] Request cancellation works
- [ ] Error handling works correctly
- [ ] Example app runs without errors

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly using the example app
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include examples of usage if adding new features
- Update documentation (README.md) as needed
- Ensure no TypeScript errors
- Test with the example app

## Reporting Issues

When reporting issues, please include:

- React API Weaver version
- Node.js version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages or logs
- OpenAPI YAML sample (if relevant)

## Questions?

Feel free to open an issue for any questions or discussions about the project.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

