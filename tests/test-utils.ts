import N8nClient from '../src/index';
import type { HttpClient } from '../src/http-client';

type MockResponse = {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
};

function createMockHttpClient(responses: MockResponse[] = []): HttpClient {
  let callIndex = 0;

  return {
    request: vi.fn().mockImplementation(async (options: { method: string; path: string }) => {
      const response = responses[callIndex] ?? responses[responses.length - 1] ?? { body: undefined };
      callIndex++;
      if (response.status && response.status >= 400) {
        throw { status: response.status, message: `HTTP ${response.status}`, data: response.body };
      }
      return response.body;
    }),
    get: vi.fn().mockImplementation(async () => {
      const response = responses[callIndex] ?? responses[responses.length - 1] ?? { body: undefined };
      callIndex++;
      return response.body;
    }),
    post: vi.fn().mockImplementation(async () => {
      const response = responses[callIndex] ?? responses[responses.length - 1] ?? { body: undefined };
      callIndex++;
      return response.body;
    }),
    put: vi.fn().mockImplementation(async () => {
      const response = responses[callIndex] ?? responses[responses.length - 1] ?? { body: undefined };
      callIndex++;
      return response.body;
    }),
    patch: vi.fn().mockImplementation(async () => {
      const response = responses[callIndex] ?? responses[responses.length - 1] ?? { body: undefined };
      callIndex++;
      return response.body;
    }),
    delete: vi.fn().mockImplementation(async () => {
      const response = responses[callIndex] ?? responses[responses.length - 1] ?? { body: undefined };
      callIndex++;
      return response.body;
    }),
  } as unknown as HttpClient;
}

export { createMockHttpClient };
