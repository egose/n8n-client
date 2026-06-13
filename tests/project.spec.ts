import { describe, expect, test } from 'vitest';
import ProjectClient from '../src/clients/project';
import { createMockHttpClient } from './test-utils';

describe('Implementation Consistency: Project', () => {
  test('list calls GET /projects', async () => {
    const http = createMockHttpClient([{ body: { data: [], nextCursor: undefined } }]);
    const handle = new ProjectClient(http);

    const result = await handle.list({ limit: 5 });

    expect(http.get).toHaveBeenCalledWith('/projects', { limit: 5 });
    expect(result).toEqual({ data: [], nextCursor: undefined });
  });

  test('create calls POST /projects', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new ProjectClient(http);

    await handle.create({ name: 'New Project' });

    expect(http.post).toHaveBeenCalledWith('/projects', { name: 'New Project' });
  });

  test('update calls PUT /projects/:id', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new ProjectClient(http);

    await handle.update('p-1', { name: 'Updated Project' });

    expect(http.put).toHaveBeenCalledWith('/projects/p-1', { name: 'Updated Project' });
  });

  test('delete calls DELETE /projects/:id', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new ProjectClient(http);

    await handle.delete('p-1');

    expect(http.delete).toHaveBeenCalledWith('/projects/p-1');
  });

  test('listMembers calls GET /projects/:id/users', async () => {
    const http = createMockHttpClient([{ body: { data: [], nextCursor: undefined } }]);
    const handle = new ProjectClient(http);

    const result = await handle.listMembers('p-1', { limit: 10 });

    expect(http.get).toHaveBeenCalledWith('/projects/p-1/users', { limit: 10 });
    expect(result).toEqual({ data: [], nextCursor: undefined });
  });

  test('addMembers calls POST /projects/:id/users', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new ProjectClient(http);

    await handle.addMembers('p-1', [{ userId: 'u-1', role: 'project:viewer' }]);

    expect(http.post).toHaveBeenCalledWith('/projects/p-1/users', {
      relations: [{ userId: 'u-1', role: 'project:viewer' }],
    });
  });

  test('removeMember calls DELETE /projects/:id/users/:userId', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new ProjectClient(http);

    await handle.removeMember('p-1', 'u-1');

    expect(http.delete).toHaveBeenCalledWith('/projects/p-1/users/u-1');
  });

  test('changeMemberRole calls PATCH /projects/:id/users/:userId', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new ProjectClient(http);

    await handle.changeMemberRole('p-1', 'u-1', 'project:editor');

    expect(http.patch).toHaveBeenCalledWith('/projects/p-1/users/u-1', { role: 'project:editor' });
  });
});
