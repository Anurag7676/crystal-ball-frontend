import { CloudOff } from 'lucide-react';
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
      className="inline-flex items-center gap-1 rounded-full bg-warm-soft px-2 py-0.5 text-[11px] font-medium text-warn-fg"
    >
      <CloudOff aria-hidden className="h-3 w-3" />
      Offline answer
    </span>
  );
}
