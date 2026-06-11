import { describe, expect, test } from 'vitest';
import TagHandle from '../src/handles/tag';
import { createMockHttpClient } from './test-utils';

describe('Implementation Consistency: Tag', () => {
  test('list calls GET /tags', async () => {
    const http = createMockHttpClient([{ body: { data: [], nextCursor: undefined } }]);
    const handle = new TagHandle(http);

    const result = await handle.list({ limit: 10 });

    expect(http.get).toHaveBeenCalledWith('/tags', { limit: 10 });
    expect(result).toEqual({ data: [], nextCursor: undefined });
  });

  test('get calls GET /tags/:id', async () => {
    const tag = { id: 't-1', name: 'Production', createdAt: '', updatedAt: '' };
    const http = createMockHttpClient([{ body: tag }]);
    const handle = new TagHandle(http);

    const result = await handle.get('t-1');

    expect(http.get).toHaveBeenCalledWith('/tags/t-1');
    expect(result).toEqual(tag);
  });

  test('create calls POST /tags', async () => {
    const created = { id: 't-2', name: 'Staging', createdAt: '', updatedAt: '' };
    const http = createMockHttpClient([{ body: created }]);
    const handle = new TagHandle(http);

    const result = await handle.create({ name: 'Staging' });

    expect(http.post).toHaveBeenCalledWith('/tags', { name: 'Staging' });
    expect(result).toEqual(created);
  });

  test('update calls PUT /tags/:id', async () => {
    const updated = { id: 't-1', name: 'Prod', createdAt: '', updatedAt: '' };
    const http = createMockHttpClient([{ body: updated }]);
    const handle = new TagHandle(http);

    const result = await handle.update('t-1', { name: 'Prod' });

    expect(http.put).toHaveBeenCalledWith('/tags/t-1', { name: 'Prod' });
    expect(result).toEqual(updated);
  });

  test('delete calls DELETE /tags/:id', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new TagHandle(http);

    await handle.delete('t-1');

    expect(http.delete).toHaveBeenCalledWith('/tags/t-1');
  });
});
