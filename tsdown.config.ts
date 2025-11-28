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

