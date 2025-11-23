import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPI, OpenAPIV3 } from 'openapi-types';
import { ParsedAPI, ParsedOperation } from './types';

/**
 * Parse OpenAPI YAML file and extract API information
 */
export async function parseOpenAPI(filePath: string): Promise<ParsedAPI> {
  try {
    // Parse and dereference the OpenAPI document
    const api = (await SwaggerParser.dereference(filePath)) as OpenAPIV3.Document;

    const operations: ParsedOperation[] = [];

    // Extract operations from paths
    if (api.paths) {
      for (const [path, pathItem] of Object.entries(api.paths)) {
        if (!pathItem) continue;

        const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;

        for (const method of methods) {
          const operation = pathItem[method] as OpenAPIV3.OperationObject | undefined;

          if (operation) {
            const operationId =
              operation.operationId || generateOperationId(method, path);

            operations.push({
              operationId,
              method: method.toUpperCase(),
              path,
              summary: operation.summary,
              description: operation.description,
              parameters: operation.parameters as OpenAPIV3.ParameterObject[],
              requestBody: operation.requestBody as OpenAPIV3.RequestBodyObject,
              responses: operation.responses,
              tags: operation.tags,
            });
          }
        }
      }
    }

    return {
      info: {
        title: api.info.title,
        version: api.info.version,
        description: api.info.description,
      },
      servers: api.servers,
      operations,
    };
  } catch (error) {
    throw new Error(`Failed to parse OpenAPI file: ${error}`);
  }
}

/**
 * Generate operation ID from method and path
 */
function generateOperationId(method: string, path: string): string {
  // Remove leading slash and replace path params
  const cleanPath = path
    .replace(/^\//, '')
    .replace(/\{([^}]+)\}/g, 'By-$1')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '');

  return `${method}${toPascalCase(cleanPath)}`;
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

