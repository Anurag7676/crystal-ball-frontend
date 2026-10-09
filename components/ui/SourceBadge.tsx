import type { FallbackReason } from '@/lib/contracts';

const REASONS: Record<FallbackReason, string> = {
  timeout: 'The AI took too long, so this is a standard answer built from the queue data.',
  provider_error: 'The AI service failed, so this is a standard answer built from the queue data.',
  missing_api_key: 'AI is not configured on the server, so this is a standard answer.',
  invalid_output: 'The AI response failed validation, so this is a standard answer built from the queue data.',
};

/** Makes it explicit when an answer did NOT come from the model. Renders nothing for AI answers. */
export function SourceBadge({ source, reason }: { source?: 'ai' | 'fallback'; reason?: FallbackReason }) {
  if (source !== 'fallback') return null;
  return (
    <span
      title={reason ? REASONS[reason] : 'Standard answer (AI unavailable)'}
      className="inline-flex h-[18px] items-center gap-1 rounded border border-line bg-surface px-1.5 text-[10.5px] font-medium text-fg-muted"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warm" />
      Offline answer
    </span>
  );
}
