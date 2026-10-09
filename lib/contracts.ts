import { z } from 'zod';

/**
 * Frontend copy of the backend API contract (crystal-ball-backend/src/schemas).
 * The two repos share no code; drift is caught by tests/contract.test.ts, which compares these
 * schemas with the JSON Schema snapshot exported by the backend (`npm run contract:export`).
 */

export const AiActionSchema = z.enum(['greeting', 'summary', 'chat', 'help', 'teach']);
export type AiAction = z.infer<typeof AiActionSchema>;

// ---------- Approvals ----------

export const ApprovalSchema = z.object({
  id: z.string().regex(/^apr-\d{3}$/),
  title: z.string().min(1),
  type: z.enum(['folder', 'video', 'pdf', 'image']),
  submittedBy: z.string().min(1),
  status: z.enum(['pending_review', 'approved', 'rejected']),
  submittedDateLabel: z.string().min(1),
});

export const ApprovalsResponseSchema = z.object({
  approvals: z.array(ApprovalSchema),
  source: z.enum(['mongodb', 'fixture']),
});

export type Approval = z.infer<typeof ApprovalSchema>;
export type ApprovalsResponse = z.infer<typeof ApprovalsResponseSchema>;

// ---------- Structured summary ----------

export const SummarySchema = z.object({
  pendingCount: z.number().int().nonnegative(),
  overview: z.string().min(1),
  priorityItems: z.array(z.object({ approvalId: z.string(), title: z.string(), reason: z.string() })),
  recommendations: z.array(z.string()),
  orderingNote: z.string(),
});

export type Summary = z.infer<typeof SummarySchema>;

// ---------- SSE events ----------

export const FallbackReasonSchema = z.enum(['timeout', 'provider_error', 'missing_api_key', 'invalid_output']);
export type FallbackReason = z.infer<typeof FallbackReasonSchema>;

export const ErrorCodeSchema = z.enum([
  'validation_error',
  'rate_limited',
  'not_found',
  'ai_unavailable',
  'internal_error',
]);

export const MetaEventSchema = z.object({
  action: AiActionSchema,
  requestId: z.string(),
  sources: z.array(z.string()).optional(),
});

export const DeltaEventSchema = z.object({ text: z.string() });

export const ResultEventSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), text: z.string() }),
  z.object({ kind: z.literal('summary'), summary: SummarySchema }),
]);

export const ErrorEventSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  retryable: z.boolean(),
});

export const DoneEventSchema = z.object({
  source: z.enum(['ai', 'fallback']),
  fallbackReason: FallbackReasonSchema.optional(),
  citedSources: z.array(z.string()).optional(),
});

export const SseEventSchemas = {
  meta: MetaEventSchema,
  delta: DeltaEventSchema,
  result: ResultEventSchema,
  error: ErrorEventSchema,
  done: DoneEventSchema,
} as const;

export type SseEventName = keyof typeof SseEventSchemas;

export type AiStreamEvent = {
  [E in SseEventName]: { event: E; data: z.infer<(typeof SseEventSchemas)[E]> };
}[SseEventName];

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
});

// ---------- Requests ----------

export interface GreetingRequest {
  sessionId: string;
  language?: string;
}
export type SummaryRequest = GreetingRequest;
export interface MessageRequest extends GreetingRequest {
  message: string;
}

export const MAX_MESSAGE_LENGTH = 1000;
