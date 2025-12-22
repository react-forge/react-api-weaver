import type { OpenAPIV3 } from 'openapi-types';

export interface ParsedOperation {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  parameters?: OpenAPIV3.ParameterObject[];
  requestBody?: OpenAPIV3.RequestBodyObject;
  responses: OpenAPIV3.ResponsesObject;
  tags?: string[];
}

export interface GeneratedFunction {
  name: string;
  method: string;
  path: string;
  description?: string;
  paramsType?: string;
  paramsInterface?: string;
  bodyType?: string;
  bodyInterface?: string;
  returnType: string;
  returnInterface?: string;
}

export interface ParsedAPI {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: { url: string }[];
  operations: ParsedOperation[];
}

