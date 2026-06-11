import { describe, expect, test } from 'vitest';
import ExecutionHandle from '../src/handles/execution';
import { createMockHttpClient } from './test-utils';

describe('Implementation Consistency: Execution', () => {
  test('list calls GET /executions with query params', async () => {
    const http = createMockHttpClient([{ body: { data: [], nextCursor: undefined } }]);
    const handle = new ExecutionHandle(http);

    const result = await handle.list({ limit: 10, status: 'success' });

    expect(http.get).toHaveBeenCalledWith('/executions', { limit: 10, status: 'success' });
    expect(result).toEqual({ data: [], nextCursor: undefined });
  });

  test('get calls GET /executions/:id', async () => {
    const execution = { id: 1, finished: true, mode: 'manual', startedAt: '', workflowId: 1, status: 'success' };
    const http = createMockHttpClient([{ body: execution }]);
    const handle = new ExecutionHandle(http);

    const result = await handle.get(1);

    expect(http.get).toHaveBeenCalledWith('/executions/1', undefined);
    expect(result).toEqual(execution);
  });

  test('delete calls DELETE /executions/:id', async () => {
    const execution = { id: 1, finished: true, mode: 'manual', startedAt: '', workflowId: 1, status: 'success' };
    const http = createMockHttpClient([{ body: execution }]);
    const handle = new ExecutionHandle(http);

    const result = await handle.delete(1);

    expect(http.delete).toHaveBeenCalledWith('/executions/1');
    expect(result).toEqual(execution);
  });

  test('retry calls POST /executions/:id/retry', async () => {
    const execution = { id: 2, finished: false, mode: 'retry', startedAt: '', workflowId: 1, status: 'running' };
    const http = createMockHttpClient([{ body: execution }]);
    const handle = new ExecutionHandle(http);

    const result = await handle.retry(2, { loadWorkflow: true });

    expect(http.post).toHaveBeenCalledWith('/executions/2/retry', { loadWorkflow: true });
    expect(result).toEqual(execution);
  });

  test('stop calls POST /executions/:id/stop', async () => {
    const execution = { id: 1, finished: false, mode: 'manual', startedAt: '', workflowId: 1, status: 'canceled' };
    const http = createMockHttpClient([{ body: execution }]);
    const handle = new ExecutionHandle(http);

    const result = await handle.stop(1);

    expect(http.post).toHaveBeenCalledWith('/executions/1/stop');
    expect(result).toEqual(execution);
  });

  test('stopMany calls POST /executions/stop', async () => {
    const http = createMockHttpClient([{ body: { stopped: 5 } }]);
    const handle = new ExecutionHandle(http);

    const result = await handle.stopMany({ status: ['running', 'waiting'] });

    expect(http.post).toHaveBeenCalledWith('/executions/stop', { status: ['running', 'waiting'] });
    expect(result).toEqual({ stopped: 5 });
  });

  test('getTags calls GET /executions/:id/tags', async () => {
    const tags = [{ id: 't-1', name: 'prod', createdAt: '', updatedAt: '' }];
    const http = createMockHttpClient([{ body: tags }]);
    const handle = new ExecutionHandle(http);

    const result = await handle.getTags(1);

    expect(http.get).toHaveBeenCalledWith('/executions/1/tags');
    expect(result).toEqual(tags);
  });

  test('updateTags calls PUT /executions/:id/tags', async () => {
    const tags = [{ id: 't-1', name: 'prod', createdAt: '', updatedAt: '' }];
    const http = createMockHttpClient([{ body: tags }]);
    const handle = new ExecutionHandle(http);

    const result = await handle.updateTags(1, [{ id: 't-1' }]);

    expect(http.put).toHaveBeenCalledWith('/executions/1/tags', [{ id: 't-1' }]);
    expect(result).toEqual(tags);
  });
});
