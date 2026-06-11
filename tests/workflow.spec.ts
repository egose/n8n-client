import { describe, expect, test, vi } from 'vitest';
import WorkflowHandle from '../src/handles/workflow';
import { createMockHttpClient } from './test-utils';

describe('Implementation Consistency: Workflow', () => {
  test('list calls GET /workflows with query params', async () => {
    const http = createMockHttpClient([{ body: { data: [], nextCursor: undefined } }]);
    const handle = new WorkflowHandle(http);

    const result = await handle.list({ limit: 10, active: true });

    expect(http.get).toHaveBeenCalledWith('/workflows', { limit: 10, active: true });
    expect(result).toEqual({ data: [], nextCursor: undefined });
  });

  test('get calls GET /workflows/:id', async () => {
    const workflow = { id: 'wf-1', name: 'My Workflow', active: false };
    const http = createMockHttpClient([{ body: workflow }]);
    const handle = new WorkflowHandle(http);

    const result = await handle.get('wf-1');

    expect(http.get).toHaveBeenCalledWith('/workflows/wf-1', undefined);
    expect(result).toEqual(workflow);
  });

  test('create calls POST /workflows', async () => {
    const created = { id: 'wf-2', name: 'New Workflow', active: false };
    const http = createMockHttpClient([{ body: created }]);
    const handle = new WorkflowHandle(http);

    const payload = { name: 'New Workflow', nodes: [], connections: {}, settings: {} };
    const result = await handle.create(payload);

    expect(http.post).toHaveBeenCalledWith('/workflows', payload);
    expect(result).toEqual(created);
  });

  test('update calls PUT /workflows/:id', async () => {
    const updated = { id: 'wf-1', name: 'Updated', active: true };
    const http = createMockHttpClient([{ body: updated }]);
    const handle = new WorkflowHandle(http);

    const payload = { name: 'Updated', nodes: [], connections: {}, settings: {} };
    const result = await handle.update('wf-1', payload);

    expect(http.put).toHaveBeenCalledWith('/workflows/wf-1', payload);
    expect(result).toEqual(updated);
  });

  test('delete calls DELETE /workflows/:id', async () => {
    const deleted = { id: 'wf-1', name: 'My Workflow', active: false };
    const http = createMockHttpClient([{ body: deleted }]);
    const handle = new WorkflowHandle(http);

    const result = await handle.delete('wf-1');

    expect(http.delete).toHaveBeenCalledWith('/workflows/wf-1');
    expect(result).toEqual(deleted);
  });

  test('activate calls POST /workflows/:id/activate', async () => {
    const activated = { id: 'wf-1', name: 'My Workflow', active: true };
    const http = createMockHttpClient([{ body: activated }]);
    const handle = new WorkflowHandle(http);

    const result = await handle.activate('wf-1');

    expect(http.post).toHaveBeenCalledWith('/workflows/wf-1/activate', undefined);
    expect(result).toEqual(activated);
  });

  test('deactivate calls POST /workflows/:id/deactivate', async () => {
    const deactivated = { id: 'wf-1', name: 'My Workflow', active: false };
    const http = createMockHttpClient([{ body: deactivated }]);
    const handle = new WorkflowHandle(http);

    const result = await handle.deactivate('wf-1');

    expect(http.post).toHaveBeenCalledWith('/workflows/wf-1/deactivate');
    expect(result).toEqual(deactivated);
  });

  test('archive calls POST /workflows/:id/archive', async () => {
    const archived = { id: 'wf-1', name: 'My Workflow', active: false, isArchived: true };
    const http = createMockHttpClient([{ body: archived }]);
    const handle = new WorkflowHandle(http);

    const result = await handle.archive('wf-1');

    expect(http.post).toHaveBeenCalledWith('/workflows/wf-1/archive');
    expect(result).toEqual(archived);
  });

  test('transfer calls PUT /workflows/:id/transfer', async () => {
    const http = createMockHttpClient([{ body: undefined }]);
    const handle = new WorkflowHandle(http);

    await handle.transfer('wf-1', 'proj-2');

    expect(http.put).toHaveBeenCalledWith('/workflows/wf-1/transfer', { destinationProjectId: 'proj-2' });
  });

  test('getTags calls GET /workflows/:id/tags', async () => {
    const tags = [{ id: 't-1', name: 'production', createdAt: '', updatedAt: '' }];
    const http = createMockHttpClient([{ body: tags }]);
    const handle = new WorkflowHandle(http);

    const result = await handle.getTags('wf-1');

    expect(http.get).toHaveBeenCalledWith('/workflows/wf-1/tags');
    expect(result).toEqual(tags);
  });

  test('updateTags calls PUT /workflows/:id/tags', async () => {
    const tags = [{ id: 't-1', name: 'production', createdAt: '', updatedAt: '' }];
    const http = createMockHttpClient([{ body: tags }]);
    const handle = new WorkflowHandle(http);

    const result = await handle.updateTags('wf-1', [{ id: 't-1' }]);

    expect(http.put).toHaveBeenCalledWith('/workflows/wf-1/tags', [{ id: 't-1' }]);
    expect(result).toEqual(tags);
  });

  test('getVersion calls GET /workflows/:id/:versionId', async () => {
    const version = { versionId: 'v-1', workflowId: 'wf-1', nodes: [], connections: {}, authors: 'admin' };
    const http = createMockHttpClient([{ body: version }]);
    const handle = new WorkflowHandle(http);

    const result = await handle.getVersion('wf-1', 'v-1');

    expect(http.get).toHaveBeenCalledWith('/workflows/wf-1/v-1');
    expect(result).toEqual(version);
  });
});
