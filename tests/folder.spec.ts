import { describe, expect, test } from 'vitest';
import FolderHandle from '../src/handles/folder';
import { createMockHttpClient } from './test-utils';

describe('Implementation Consistency: Folder', () => {
  test('list calls GET /projects/:projectId/folders', async () => {
    const http = createMockHttpClient([{ body: { count: 0, data: [] } }]);
    const handle = new FolderHandle(http, 'proj-1');

    const result = await handle.list({ take: '10' });

    expect(http.get).toHaveBeenCalledWith('/projects/proj-1/folders', { take: '10' });
    expect(result).toEqual({ count: 0, data: [] });
  });

  test('get calls GET /projects/:projectId/folders/:folderId', async () => {
    const folder = { id: 'f-1', name: 'My Folder', createdAt: '', updatedAt: '' };
    const http = createMockHttpClient([{ body: folder }]);
    const handle = new FolderHandle(http, 'proj-1');

    const result = await handle.get('f-1');

    expect(http.get).toHaveBeenCalledWith('/projects/proj-1/folders/f-1');
    expect(result).toEqual(folder);
  });

  test('create calls POST /projects/:projectId/folders', async () => {
    const created = { id: 'f-2', name: 'New Folder', createdAt: '', updatedAt: '' };
    const http = createMockHttpClient([{ body: created }]);
    const handle = new FolderHandle(http, 'proj-1');

    const result = await handle.create({ name: 'New Folder' });

    expect(http.post).toHaveBeenCalledWith('/projects/proj-1/folders', { name: 'New Folder' });
    expect(result).toEqual(created);
  });

  test('update calls PATCH /projects/:projectId/folders/:folderId', async () => {
    const updated = { id: 'f-1', name: 'Updated Folder', createdAt: '', updatedAt: '' };
    const http = createMockHttpClient([{ body: updated }]);
    const handle = new FolderHandle(http, 'proj-1');

    const result = await handle.update('f-1', { name: 'Updated Folder' });

    expect(http.patch).toHaveBeenCalledWith('/projects/proj-1/folders/f-1', { name: 'Updated Folder' });
    expect(result).toEqual(updated);
  });

  test('delete calls DELETE /projects/:projectId/folders/:folderId', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new FolderHandle(http, 'proj-1');

    await handle.delete('f-1');

    expect(http.delete).toHaveBeenCalledWith('/projects/proj-1/folders/f-1', undefined);
  });

  test('delete with transferToFolderId passes query param', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new FolderHandle(http, 'proj-1');

    await handle.delete('f-1', 'f-2');

    expect(http.delete).toHaveBeenCalledWith('/projects/proj-1/folders/f-1', { transferToFolderId: 'f-2' });
  });
});
