import { act } from '@testing-library/react';
import type { AiAction, AiStreamEvent } from '@/lib/contracts';

interface PendingCall {
  action: AiAction;
  body: unknown;
  emit: (event: AiStreamEvent) => void;
  resolve: () => void;
  reject: (err: unknown) => void;
  signal?: AbortSignal;
}

/**
 * Stand-in for streamAiAction that lets a test push SSE events one at a time,
 * so loading → streaming → done/error transitions can be asserted in between.
 */
export function createControlledStream() {
  const calls: PendingCall[] = [];

  const impl = (action: AiAction, body: unknown, onEvent: (e: AiStreamEvent) => void, signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      calls.push({ action, body, emit: onEvent, resolve, reject, signal });
    });

  const last = (action?: AiAction) => {
    const call = [...calls].reverse().find((c) => !action || c.action === action);
    if (!call) throw new Error(`No streamAiAction call${action ? ` for ${action}` : ''}`);
    return call;
  };

  return {
    impl,
    calls,
    last,
    /** Emit events on the latest call for `action`, inside act(). */
    emit(action: AiAction, ...events: AiStreamEvent[]) {
      const call = last(action);
      act(() => events.forEach((e) => call.emit(e)));
    },
    async finish(action: AiAction, ...events: AiStreamEvent[]) {
      const call = last(action);
      await act(async () => {
        events.forEach((e) => call.emit(e));
        call.resolve();
      });
    },
    async fail(action: AiAction, err: unknown) {
      const call = last(action);
      await act(async () => call.reject(err));
    },
  };
}

export const meta = (action: AiAction): AiStreamEvent => ({ event: 'meta', data: { action, requestId: 'req-1' } });
export const delta = (text: string): AiStreamEvent => ({ event: 'delta', data: { text } });
export const doneAi: AiStreamEvent = { event: 'done', data: { source: 'ai' } };
