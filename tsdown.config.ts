import { defineConfig } from 'tsdown';

export default defineConfig([
  // Main library bundle
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['react'],
    treeshake: true,
    platform: 'browser',
  },
  // React 18 specific bundle
  {
    entry: {
      'react18/index': 'src/hooks/react18/index.ts',
    },
    format: ['cjs', 'esm'],
    outDir: 'dist',
    dts: true,
    clean: false,
    sourcemap: true,
    external: ['react'],
    treeshake: true,
    platform: 'browser',
  },
  // React 19 specific bundle
  {
    entry: {
      'react19/index': 'src/hooks/react19/index.ts',
    },
    format: ['cjs', 'esm'],
    outDir: 'dist',
    dts: true,
    clean: false,
    sourcemap: true,
    external: ['react'],
    treeshake: true,
    platform: 'browser',
  },
  // CLI bundle
  {
    entry: {
      cli: 'src/cli/index.ts',
    },
    format: ['cjs'],
    outDir: 'dist',
    dts: false,
    clean: false,
    sourcemap: false,
    outputOptions: {
      banner: '#!/usr/bin/env node',
    },
    external: [
      'commander',
      'js-yaml',
      '@apidevtools/swagger-parser',
      'chokidar',
      'openapi-typescript',
      'openapi-types',
    ],
  },
]);
