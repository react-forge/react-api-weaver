import { defineConfig } from 'tsup';

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
    entry: ['src/cli/index.ts'],
    format: ['cjs'],
    outDir: 'dist',
    outExtension: () => ({ js: '.js' }),
    dts: false,
    clean: false,
    sourcemap: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
    external: ['commander', 'js-yaml', '@apidevtools/swagger-parser', 'chokidar', 'openapi-typescript', 'openapi-types'],
  },
]);

