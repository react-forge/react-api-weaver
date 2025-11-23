import { RequestConfig } from '../types';

export interface MakeRequestOptions extends RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: any;
  params?: Record<string, any>;
}

/**
 * Build URL with query parameters
 */
function buildURL(baseURL: string, url: string, params?: Record<string, any>): string {
  const fullURL = baseURL ? `${baseURL}${url}` : url;
  
  if (!params || Object.keys(params).length === 0) {
    return fullURL;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${fullURL}?${queryString}` : fullURL;
}

/**
 * Make HTTP request using fetch API
 */
export async function makeRequest<T = any>(
  options: MakeRequestOptions
): Promise<T> {
  const {
    method,
    url,
    body,
    params,
    headers = {},
    baseURL = '',
    timeout = 30000,
    signal,
  } = options;

  const fullURL = buildURL(baseURL, url, params);

  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Combine signals if provided
  const combinedSignal = signal
    ? combineAbortSignals([signal, controller.signal])
    : controller.signal;

  try {
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: combinedSignal,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(fullURL, requestOptions);

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP Error: ${response.status} ${response.statusText}`
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    const text = await response.text();
    return (text ? text : null) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request was aborted');
    }

    throw error;
  }
}

/**
 * Combine multiple abort signals
 */
function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }

    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  return controller.signal;
}

/**
 * Create a request wrapper with default configuration
 */
export function createRequestWrapper(defaultConfig: Partial<RequestConfig> = {}) {
  return async <T = any>(options: MakeRequestOptions): Promise<T> => {
    return makeRequest<T>({
      ...options,
      headers: {
        ...defaultConfig.headers,
        ...options.headers,
      },
      baseURL: options.baseURL || defaultConfig.baseURL,
      timeout: options.timeout || defaultConfig.timeout,
    });
  };
}

