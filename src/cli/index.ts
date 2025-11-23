#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { watch } from 'chokidar';
import { parseOpenAPI } from '../generator/parser';
import { generateTypeScriptCode, generateJavaScriptCode } from '../generator/codegen';

const program = new Command();

program
  .name('react-api-weaver')
  .description('Generate TypeScript/JavaScript API client from OpenAPI YAML')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate API client code from OpenAPI YAML file')
  .requiredOption('-i, --input <path>', 'Path to OpenAPI YAML file')
  .requiredOption('-o, --output <path>', 'Output directory for generated code')
  .option('-f, --format <format>', 'Output format: ts, js, or both', 'ts')
  .option('-b, --base-url <url>', 'Base URL for API requests')
  .action(async (options) => {
    await generateCode(options);
  });

program
  .command('watch')
  .description('Watch OpenAPI YAML file and regenerate on changes')
  .requiredOption('-i, --input <path>', 'Path to OpenAPI YAML file')
  .requiredOption('-o, --output <path>', 'Output directory for generated code')
  .option('-f, --format <format>', 'Output format: ts, js, or both', 'ts')
  .option('-b, --base-url <url>', 'Base URL for API requests')
  .action(async (options) => {
    console.log(`👀 Watching ${options.input} for changes...`);
    
    // Generate initially
    await generateCode(options);

    // Watch for changes
    const watcher = watch(options.input, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('change', async () => {
      console.log(`\n🔄 File changed, regenerating...`);
      await generateCode(options);
    });

    watcher.on('error', (error) => {
      console.error('❌ Watcher error:', error);
    });

    // Keep process running
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping watcher...');
      watcher.close();
      process.exit(0);
    });
  });

async function generateCode(options: {
  input: string;
  output: string;
  format: string;
  baseUrl?: string;
}) {
  try {
    const { input, output, format, baseUrl } = options;

    // Validate input file
    if (!fs.existsSync(input)) {
      throw new Error(`Input file not found: ${input}`);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(output)) {
      fs.mkdirSync(output, { recursive: true });
    }

    console.log(`📖 Parsing OpenAPI file: ${input}`);
    
    // Parse OpenAPI YAML
    const parsedAPI = await parseOpenAPI(input);
    
    console.log(`✅ Parsed ${parsedAPI.operations.length} operations`);

    // Generate TypeScript code
    if (format === 'ts' || format === 'both') {
      console.log('🔨 Generating TypeScript code...');
      const tsCode = generateTypeScriptCode(parsedAPI, baseUrl);
      const tsOutputPath = path.join(output, 'api.ts');
      fs.writeFileSync(tsOutputPath, tsCode);
      console.log(`✅ Generated TypeScript: ${tsOutputPath}`);
    }

    // Generate JavaScript code
    if (format === 'js' || format === 'both') {
      console.log('🔨 Generating JavaScript code...');
      const jsCode = generateJavaScriptCode(parsedAPI, baseUrl);
      const jsOutputPath = path.join(output, 'api.js');
      fs.writeFileSync(jsOutputPath, jsCode);
      console.log(`✅ Generated JavaScript: ${jsOutputPath}`);
    }

    // Generate index file for easy imports
    generateIndexFile(output, format);

    console.log(`\n🎉 Code generation complete!`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function generateIndexFile(output: string, format: string) {
  if (format === 'ts' || format === 'both') {
    const indexContent = `export * from './api';\n`;
    fs.writeFileSync(path.join(output, 'index.ts'), indexContent);
  }

  if (format === 'js' || format === 'both') {
    const indexContent = `export * from './api.js';\n`;
    fs.writeFileSync(path.join(output, 'index.js'), indexContent);
  }
}

program.parse();

