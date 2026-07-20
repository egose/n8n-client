import { describe, expect, it, vi } from 'vitest';

import { signPayload } from '../src/shared/auth';
import { sendSyncEvent, SyncSendError } from '../src/shared/http';
import type { SyncEvent } from '../src/shared/types';

const event: SyncEvent = {
  type: 'workflow.delete',
  at: '2026-01-01T00:00:00.000Z',
  sourceId: 'test',
  workflowId: 'wf-1',
};

function jsonResponse(status: number): Response {
  return { ok: status >= 200 && status < 300, status } as Response;
}

function headersOf(fetchImpl: ReturnType<typeof vi.fn>, call: number): Record<string, string> {
  return fetchImpl.mock.calls[call][1].headers as Record<string, string>;
}

describe('sendSyncEvent', () => {
  it('POSTs the event with hmac signature headers by default', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200));
    const nowMs = vi.fn().mockReturnValue(1_800_000_000_000);

    await sendSyncEvent(event, {
      url: 'https://sub.example.com/rest/sync/v1/events',
      token: 'secret',
      fetchImpl,
      nowMs,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://sub.example.com/rest/sync/v1/events');
    expect(init.method).toBe('POST');

    const headers = headersOf(fetchImpl, 0);
    expect(headers['x-sync-timestamp']).toBe('1800000000000');
    expect(headers['x-sync-signature']).toBe(signPayload('secret', '1800000000000', JSON.stringify(event)));
    expect(headers).not.toHaveProperty('x-sync-token');
    expect(JSON.parse(init.body as string)).toEqual(event);
  });

  it('sends the static bearer token in token mode', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200));

    await sendSyncEvent(event, { url: 'u', token: 'secret', authMode: 'token', fetchImpl });

    const headers = headersOf(fetchImpl, 0);
    expect(headers['x-sync-token']).toBe('secret');
    expect(headers).not.toHaveProperty('x-sync-signature');
    expect(headers).not.toHaveProperty('x-sync-timestamp');
  });

  it('re-signs with a fresh timestamp on every attempt', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse(500)).mockResolvedValue(jsonResponse(200));
    const sleep = vi.fn().mockResolvedValue(undefined);
    const nowMs = vi.fn().mockReturnValueOnce(1000).mockReturnValue(2000);

    await sendSyncEvent(event, { url: 'u', token: 'secret', fetchImpl, sleep, nowMs });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(headersOf(fetchImpl, 0)['x-sync-timestamp']).toBe('1000');
    expect(headersOf(fetchImpl, 1)['x-sync-timestamp']).toBe('2000');
    expect(headersOf(fetchImpl, 1)['x-sync-signature']).toBe(signPayload('secret', '2000', JSON.stringify(event)));
  });

  it('retries retryable statuses with exponential backoff', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(500))
      .mockResolvedValueOnce(jsonResponse(503))
      .mockResolvedValue(jsonResponse(200));
    const sleep = vi.fn().mockResolvedValue(undefined);

    await sendSyncEvent(event, { url: 'u', token: 't', fetchImpl, sleep });

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenNthCalledWith(1, 1000);
    expect(sleep).toHaveBeenNthCalledWith(2, 2000);
  });

  it('throws immediately on non-retryable statuses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(401));
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(sendSyncEvent(event, { url: 'u', token: 't', fetchImpl, sleep })).rejects.toThrow(SyncSendError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('retries network errors and throws after exhausting attempts', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(sendSyncEvent(event, { url: 'u', token: 't', fetchImpl, sleep, maxRetries: 3 })).rejects.toThrow(
      'ECONNREFUSED',
    );
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it('throws a SyncSendError when retryable statuses persist', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(429));
    const sleep = vi.fn().mockResolvedValue(undefined);

    const promise = sendSyncEvent(event, { url: 'u', token: 't', fetchImpl, sleep, maxRetries: 2 });
    await expect(promise).rejects.toMatchObject({ name: 'SyncSendError', status: 429 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
