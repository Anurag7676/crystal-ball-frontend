import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchApprovals, streamAiAction } from '@/lib/api';
import type { AiStreamEvent } from '@/lib/contracts';

const encoder = new TextEncoder();

function sseResponse(chunks: string[], init: ResponseInit = {}) {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' }, ...init });
}

const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

async function run(response: Response | Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(Promise.resolve(response)));
  const events: AiStreamEvent[] = [];
  await streamAiAction('greeting', { sessionId: 'session-1234' }, (e) => events.push(e));
  return events;
}

afterEach(() => vi.unstubAllGlobals());

describe('streamAiAction', () => {
  it('POSTs JSON to the backend and emits validated, typed events in order', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([
        sse('meta', { action: 'greeting', requestId: 'r1' }),
        sse('delta', { text: 'Hi' }),
        sse('done', { source: 'ai' }),
      ]),
    );
    vi.stubGlobal('fetch', fetchMock);
    const events: AiStreamEvent[] = [];

    await streamAiAction('greeting', { sessionId: 'session-1234', language: 'en' }, (e) => events.push(e));

    expect(events.map((e) => e.event)).toEqual(['meta', 'delta', 'done']);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toMatch(/\/api\/ai\/greeting$/);
    expect(init).toMatchObject({ method: 'POST', body: JSON.stringify({ sessionId: 'session-1234', language: 'en' }) });
  });

  it('turns a JSON error response (e.g. 429) into a typed ApiError', async () => {
    const response = new Response(
      JSON.stringify({ error: { code: 'rate_limited', message: 'Too many AI requests.' } }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );

    await expect(run(response)).rejects.toMatchObject({ code: 'rate_limited', status: 429, retryable: true });
  });

  it('rejects an event whose payload breaks the contract instead of trusting it', async () => {
    const response = sseResponse([sse('meta', { action: 'greeting', requestId: 'r1' }), sse('delta', { txt: 'oops' })]);

    await expect(run(response)).rejects.toMatchObject({ code: 'invalid_response' });
  });

  it('rejects a stream that answers for a different action than the one requested', async () => {
    const response = sseResponse([sse('meta', { action: 'help', requestId: 'r1' }), sse('done', { source: 'ai' })]);

    await expect(run(response)).rejects.toMatchObject({ code: 'invalid_response' });
  });

  it('treats a stream that ends without done/error as interrupted', async () => {
    const response = sseResponse([sse('meta', { action: 'greeting', requestId: 'r1' }), sse('delta', { text: 'Hal' })]);

    await expect(run(response)).rejects.toMatchObject({ code: 'stream_interrupted', retryable: true });
  });

  it('reports network failures as a retryable ApiError', async () => {
    await expect(run(Promise.reject(new TypeError('Failed to fetch')))).rejects.toMatchObject({
      code: 'network_error',
      retryable: true,
    });
  });

  it('lets cancellation propagate as an AbortError', async () => {
    const abort = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    const controller = new AbortController();
    controller.abort();

    await expect(streamAiAction('greeting', { sessionId: 'session-1234' }, () => {}, controller.signal)).rejects.toBe(
      abort,
    );
  });
});

describe('fetchApprovals', () => {
  const emptyPage = {
    approvals: [],
    total: 0,
    page: 1,
    pageSize: 10,
    pageCount: 1,
    pendingCount: 0,
    source: 'fixture',
    facets: { type: [], submittedBy: [], status: [] },
  };

  it('encodes search, list filters and paging as query params, omitting empty ones', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(emptyPage)));
    vi.stubGlobal('fetch', fetchMock);

    await fetchApprovals({ q: ' camera ', type: ['pdf', 'image'], submittedBy: [], page: 2, pageSize: 25 });

    const url = new URL(fetchMock.mock.calls[0]![0] as string);
    expect(url.pathname).toBe('/api/approvals');
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: 'camera', type: 'pdf,image', page: '2', pageSize: '25' });
  });

  it('validates the approvals payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ approvals: [{ id: 1 }] }))));
    await expect(fetchApprovals({})).rejects.toBeInstanceOf(ApiError);
  });
});
