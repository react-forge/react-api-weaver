import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { makeRequest, createRequestWrapper } from '../../core/request';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Request Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('makeRequest', () => {
    it('should make a successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      });

      const result = await makeRequest({
        method: 'GET',
        url: '/api/test',
      });

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should make a successful POST request with body', async () => {
      const mockData = { id: 1, title: 'New Item' };
      const requestBody = { title: 'New Item' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      });

      const result = await makeRequest({
        method: 'POST',
        url: '/api/items',
        body: requestBody,
      });

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should make PUT request', async () => {
      const mockData = { id: 1, title: 'Updated' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      });

      const result = await makeRequest({
        method: 'PUT',
        url: '/api/items/1',
        body: { title: 'Updated' },
      });

      expect(result).toEqual(mockData);
    });

    it('should make PATCH request', async () => {
      const mockData = { id: 1, title: 'Patched' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      });

      const result = await makeRequest({
        method: 'PATCH',
        url: '/api/items/1',
        body: { title: 'Patched' },
      });

      expect(result).toEqual(mockData);
    });

    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => '',
      });

      const result = await makeRequest({
        method: 'DELETE',
        url: '/api/items/1',
      });

      expect(result).toBeNull();
    });

    it('should build URL with query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [],
      });

      await makeRequest({
        method: 'GET',
        url: '/api/items',
        params: { page: 1, limit: 10, filter: 'active' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/items?page=1&limit=10&filter=active',
        expect.any(Object)
      );
    });

    it('should handle base URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await makeRequest({
        method: 'GET',
        url: '/api/test',
        baseURL: 'https://api.example.com',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/test',
        expect.any(Object)
      );
    });

    it('should ignore null and undefined params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [],
      });

      await makeRequest({
        method: 'GET',
        url: '/api/items',
        params: { page: 1, filter: null, sort: undefined },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/items?page=1',
        expect.any(Object)
      );
    });

    it('should handle abort signal', async () => {
      const controller = new AbortController();
      
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new DOMException('The operation was aborted', 'AbortError'));
          }, 100);
        })
      );

      const requestPromise = makeRequest({
        method: 'GET',
        url: '/api/test',
        signal: controller.signal,
      });

      controller.abort();
      vi.advanceTimersByTime(100);

      await expect(requestPromise).rejects.toThrow('Request was aborted');
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Resource not found' }),
      });

      await expect(
        makeRequest({
          method: 'GET',
          url: '/api/missing',
        })
      ).rejects.toThrow('Resource not found');
    });

    it('should handle HTTP error without JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'text/plain' }),
        json: async () => {
          throw new Error('Not JSON');
        },
      });

      await expect(
        makeRequest({
          method: 'GET',
          url: '/api/error',
        })
      ).rejects.toThrow('HTTP Error: 500 Internal Server Error');
    });

    it('should handle non-JSON responses', async () => {
      const textResponse = 'Plain text response';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => textResponse,
      });

      const result = await makeRequest({
        method: 'GET',
        url: '/api/text',
      });

      expect(result).toBe(textResponse);
    });

    it('should handle empty responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => '',
      });

      const result = await makeRequest({
        method: 'DELETE',
        url: '/api/items/1',
      });

      expect(result).toBeNull();
    });

    it('should include custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await makeRequest({
        method: 'GET',
        url: '/api/test',
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token123',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should not include body for GET requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await makeRequest({
        method: 'GET',
        url: '/api/test',
        body: { should: 'not be included' },
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('/api/test');
      expect(callArgs[1].method).toBe('GET');
      expect(callArgs[1].body).toBeUndefined();
    });
  });

  describe('createRequestWrapper', () => {
    it('should create a wrapper with default config', async () => {
      const wrapper = createRequestWrapper({
        baseURL: 'https://api.example.com',
        headers: { 'Authorization': 'Bearer token' },
        timeout: 5000,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true }),
      });

      await wrapper({
        method: 'GET',
        url: '/api/test',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token',
          }),
        })
      );
    });

    it('should allow overriding default config', async () => {
      const wrapper = createRequestWrapper({
        baseURL: 'https://api.example.com',
        headers: { 'Authorization': 'Bearer token1' },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true }),
      });

      await wrapper({
        method: 'GET',
        url: '/api/test',
        baseURL: 'https://api2.example.com',
        headers: { 'Authorization': 'Bearer token2' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api2.example.com/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token2',
          }),
        })
      );
    });

    it('should merge headers correctly', async () => {
      const wrapper = createRequestWrapper({
        headers: { 
          'Authorization': 'Bearer token',
          'X-Custom': 'value1',
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true }),
      });

      await wrapper({
        method: 'GET',
        url: '/api/test',
        headers: { 
          'X-Custom': 'value2',
          'X-Another': 'value3',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token',
            'X-Custom': 'value2', // Should override default
            'X-Another': 'value3',
          }),
        })
      );
    });
  });
});

