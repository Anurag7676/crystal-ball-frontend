import {
  type AiAction,
  type AiStreamEvent,
  type ApprovalsResponse,
  ApprovalsResponseSchema,
  ErrorResponseSchema,
  type GreetingRequest,
  type MessageRequest,
  SseEventSchemas,
} from './contracts';
import { createSseParser } from './sse';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export type ApiErrorCode =
  | 'validation_error'
  | 'rate_limited'
  | 'not_found'
  | 'ai_unavailable'
  | 'internal_error'
  | 'network_error'
  | 'invalid_response'
  | 'stream_interrupted';

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Whether "Try again" makes sense for this failure. */
  get retryable() {
    return this.code !== 'validation_error' && this.code !== 'not_found';
  }
}

const isAbort = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';

async function send(path: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch (err) {
    if (isAbort(err)) throw err;
    throw new ApiError('network_error', 'Could not reach the server. Check your connection and try again.');
  }
  if (!res.ok) {
    const body = ErrorResponseSchema.safeParse(await res.json().catch(() => null));
    if (body.success) throw new ApiError(body.data.error.code, body.data.error.message, res.status);
    throw new ApiError('internal_error', `Request failed (${res.status})`, res.status);
  }
  return res;
}

export async function fetchApprovals(signal?: AbortSignal): Promise<ApprovalsResponse> {
  const res = await send('/api/approvals', { signal });
  const parsed = ApprovalsResponseSchema.safeParse(await res.json().catch(() => null));
  if (!parsed.success) throw new ApiError('invalid_response', 'The server returned unexpected approval data.');
  return parsed.data;
}

type AiRequestBody = GreetingRequest | MessageRequest;

/**
 * POSTs to an AI endpoint and dispatches each SSE event after validating it against the contract.
 * Resolves once `done` or `error` arrives; rejects with ApiError on HTTP/network/contract
 * failures or if the stream is cut off; rethrows AbortError on cancellation.
 */
export async function streamAiAction(
  action: AiAction,
  body: AiRequestBody,
  onEvent: (event: AiStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await send(`/api/ai/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.body) throw new ApiError('invalid_response', 'The server did not return a stream.');

  let finished = false;
  let contractError: ApiError | undefined;
  const parser = createSseParser(({ event, data }) => {
    if (finished || contractError || !(event in SseEventSchemas)) return;
    const schema = SseEventSchemas[event as keyof typeof SseEventSchemas];
    let json: unknown;
    try {
      json = JSON.parse(data);
    } catch {
      json = undefined;
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      contractError = new ApiError('invalid_response', 'The assistant sent a response we could not read.');
      return;
    }
    if (event === 'done' || event === 'error') finished = true;
    onEvent({ event, data: parsed.data } as AiStreamEvent);
  });

  const reader = res.body.getReader();
  try {
    while (!finished && !contractError) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.push(value);
    }
    if (!finished && !contractError) parser.flush();
  } catch (err) {
    if (isAbort(err)) throw err;
    throw new ApiError('stream_interrupted', 'The connection dropped while the assistant was responding.');
  } finally {
    reader.cancel().catch(() => undefined);
  }

  if (contractError) throw contractError;
  if (!finished) {
    throw new ApiError('stream_interrupted', 'The connection dropped while the assistant was responding.');
  }
}
