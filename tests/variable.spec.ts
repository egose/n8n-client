import { describe, expect, test } from 'vitest';
import VariableHandle from '../src/handles/variable';
import { createMockHttpClient } from './test-utils';

describe('Implementation Consistency: Variable', () => {
  test('list calls GET /variables', async () => {
    const http = createMockHttpClient([{ body: { data: [], nextCursor: undefined } }]);
    const handle = new VariableHandle(http);

    const result = await handle.list({ limit: 10 });

    expect(http.get).toHaveBeenCalledWith('/variables', { limit: 10 });
    expect(result).toEqual({ data: [], nextCursor: undefined });
  });

  test('create calls POST /variables', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new VariableHandle(http);

    await handle.create({ key: 'MY_API_KEY', value: 'secret123' });

    expect(http.post).toHaveBeenCalledWith('/variables', { key: 'MY_API_KEY', value: 'secret123' });
  });

  test('update calls PUT /variables/:id', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new VariableHandle(http);

    await handle.update('v-1', { key: 'MY_API_KEY', value: 'newsecret' });

    expect(http.put).toHaveBeenCalledWith('/variables/v-1', { key: 'MY_API_KEY', value: 'newsecret' });
  });

  test('delete calls DELETE /variables/:id', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new VariableHandle(http);

    await handle.delete('v-1');

    expect(http.delete).toHaveBeenCalledWith('/variables/v-1');
  });
});
