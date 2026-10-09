import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import backendContract from '@/contract/api-contract.json';
import {
  ApprovalsResponseSchema,
  DeltaEventSchema,
  DoneEventSchema,
  ErrorEventSchema,
  ErrorResponseSchema,
  GreetingRequestSchema,
  MessageRequestSchema,
  MetaEventSchema,
  ResultEventSchema,
} from '@/lib/contracts';

/**
 * contract/api-contract.json is exported by crystal-ball-backend (`npm run contract:export`).
 * If the backend changes a request, response or SSE event shape, this test fails until the
 * frontend schemas in lib/contracts.ts are updated to match.
 */
const json = (schema: z.ZodType) => JSON.parse(JSON.stringify(z.toJSONSchema(schema, { io: 'input' })));

describe('frontend ↔ backend API contract', () => {
  it.each([
    ['requests.greeting', GreetingRequestSchema, backendContract.requests.greeting],
    ['requests.summary', GreetingRequestSchema, backendContract.requests.summary],
    ['requests.chat', MessageRequestSchema, backendContract.requests.chat],
    ['requests.help', MessageRequestSchema, backendContract.requests.help],
    ['requests.teach', MessageRequestSchema, backendContract.requests.teach],
    ['responses.approvals', ApprovalsResponseSchema, backendContract.responses.approvals],
    ['responses.error', ErrorResponseSchema, backendContract.responses.error],
    ['sseEvents.meta', MetaEventSchema, backendContract.sseEvents.meta],
    ['sseEvents.delta', DeltaEventSchema, backendContract.sseEvents.delta],
    ['sseEvents.result', ResultEventSchema, backendContract.sseEvents.result],
    ['sseEvents.error', ErrorEventSchema, backendContract.sseEvents.error],
    ['sseEvents.done', DoneEventSchema, backendContract.sseEvents.done],
  ] as const)('%s matches the backend', (_name, schema, expected) => {
    expect(json(schema)).toEqual(expected);
  });
});
