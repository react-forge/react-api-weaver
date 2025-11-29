# React API Weaver - Examples

This directory contains example applications showcasing React API Weaver with different React versions.

## 📁 Available Examples

### React 18 Example
**Location:** `react-18/`

Demo application using React API Weaver with **React 18.2.0**.

```bash
cd react-18
yarn install
yarn dev
```

### React 19 Example
**Location:** `react-19/`

Demo application using React API Weaver with **React 19.0.0**.

```bash
cd react-19
yarn install
yarn dev
```

## 🎯 What's Inside

Both examples demonstrate:
- **GET requests** with caching enabled
- **POST requests** for creating resources
- **Automatic polling** functionality
- **Request cancellation** with abort signals
- **Form actions** integration
- **Optimistic updates** pattern
- TypeScript code generation from OpenAPI specifications

## 🚀 Getting Started

1. Navigate to the React version folder you want to try:
   ```bash
   cd react-18  # or cd react-19
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Generate API client code:
   ```bash
   yarn generate
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Documentation

Each example folder contains its own README with detailed information about:
- Project structure
- Available components
- API integration patterns
- Development workflow

## 🔧 OpenAPI Specification

Both examples use the same OpenAPI specification located in their respective `service-storybook/todo-api.yaml` files. This YAML file defines a Todo API based on [JSONPlaceholder](https://jsonplaceholder.typicode.com/).

## 🆚 React 18 vs React 19

These examples help you test and compare React API Weaver's behavior across different React versions. The library is designed to work seamlessly with both versions, but you can use these examples to:

- Verify compatibility with your React version
- Test new React features (like React 19's enhanced features)
- Ensure consistent behavior across versions
- Benchmark performance differences

## 📚 Learn More

- [React API Weaver Documentation](../README.md)
- [OpenAPI Specification](https://swagger.io/specification/)
- [React 18 Documentation](https://react.dev/)
- [React 19 Documentation](https://react.dev/blog/2024/04/25/react-19)

---

Happy coding! 🚀

