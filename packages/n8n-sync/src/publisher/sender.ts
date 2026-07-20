import { sendSyncEvent } from '../shared/http';
import { logError, type Logger } from '../shared/logger';
import type { SyncAuthMode } from '../shared/auth';
import type { SyncEvent } from '../shared/types';

export interface EventSenderOptions {
  /** Base URL of the target instance (no trailing slash). */
  baseUrl: string;
  eventsPath: string;
  secret: string;
  authMode: SyncAuthMode;
  timeoutMs: number;
  maxRetries: number;
  log: Logger;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
  /** Injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
}

export interface EventSender {
  /**
   * Enqueue an event for delivery. Resolves once the event is queued —
   * delivery continues in the background so n8n hooks stay fast.
   */
  send(event: SyncEvent): void;
  /** Resolves when every queued event has been delivered (or has failed). */
  drain(): Promise<void>;
}

/**
 * Create a per-target sender with a serialized delivery queue: events are
 * delivered one at a time, in the exact order the hooks fired. A failed
 * delivery is logged and does not block the rest of the queue — the
 * subscriber's last-write-wins guard converges state on the next event.
 */
export function createEventSender(options: EventSenderOptions): EventSender {
  const url = `${options.baseUrl}${options.eventsPath}`;
  let chain: Promise<void> = Promise.resolve();

  const deliver = (event: SyncEvent): Promise<void> =>
    sendSyncEvent(event, {
      url,
      token: options.secret,
      authMode: options.authMode,
      timeoutMs: options.timeoutMs,
      maxRetries: options.maxRetries,
      log: options.log,
      fetchImpl: options.fetchImpl,
      sleep: options.sleep,
    });

  const send = (event: SyncEvent): void => {
    chain = chain
      .then(() => deliver(event))
      .then(() => {
        options.log.debug('Sync event delivered', { type: event.type, target: url });
      })
      .catch((error: unknown) => {
        logError(options.log, error, { context: 'publish sync event', type: event.type, target: url });
      });
  };

  return {
    send,
    drain: () => chain,
  };
}
