import { useEffect } from 'react';
import { AssistantAvatar } from '@/components/ui/BrandMark';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Thinking } from '@/components/ui/Thinking';
import { useSmoothText } from '@/hooks/useSmoothText';
import type { ChatMessage } from '@/store/assistantStore';
import { FormattedText } from './FormattedText';

interface Props {
  message: ChatMessage;
  onRetry?: () => void;
  /** Called as more of the reply becomes visible (used to keep the log scrolled). */
  onReveal?: () => void;
}

/**
 * Citations to show for a finished answer: the backend-validated `citedSources`, de-duplicated and
 * restricted to the chunks this answer was grounded on (`meta.sources`) as a second check.
 */
export function displayedCitations(message: ChatMessage): string[] {
  if (message.status !== 'done' || !message.citedSources) return [];
  const grounded = message.sources;
  return [...new Set(message.citedSources)].filter((id) => !grounded || grounded.includes(id));
}

/** Footer listing the sections the answer actually cited. Renders nothing when there are none. */
function SourcesLine({ message }: { message: ChatMessage }) {
  const ids = displayedCitations(message);
  if (ids.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      Sources:{' '}
      {ids.map((id, i) => (
        <span key={id} className="rounded border border-line px-1 font-mono text-[10px] text-fg-muted">
          {id}
          {i < ids.length - 1 && <span className="sr-only">, </span>}
        </span>
      ))}
    </span>
  );
}

/** One assistant reply: thinking → tokens with a caret → final text, fallback badge, or error. */
export function StreamingMessage({ message, onRetry, onReveal }: Props) {
  const streaming = message.status === 'streaming';
  const visible = useSmoothText(message.content, streaming);
  const revealing = streaming || visible.length < message.content.length;

  // Let the conversation follow the text as it is revealed, not just as it arrives.
  useEffect(() => {
    onReveal?.();
  }, [visible.length, onReveal]);

  return (
    <div className="flex animate-rise gap-2.5">
      <AssistantAvatar className="mt-px h-5 w-5" />
      <div className="min-w-0 flex-1 space-y-1.5">
        {streaming && !message.content && <Thinking />}
        {message.content && message.status !== 'error' && (
          <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-fg">
            <FormattedText text={visible} />
            {revealing && (
              <span aria-hidden className="ml-0.5 inline-block h-3.5 w-[2px] animate-caret bg-fg align-text-bottom" />
            )}
          </div>
        )}
        {message.status === 'error' && message.error && (
          <ErrorNotice message={message.error.message} onRetry={message.error.retryable ? onRetry : undefined} />
        )}
        {(message.status === 'cancelled' ||
          message.source === 'fallback' ||
          displayedCitations(message).length > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-fg-subtle">
            {message.status === 'cancelled' && <span>Stopped</span>}
            <SourceBadge source={message.source} reason={message.fallbackReason} />
            <SourcesLine message={message} />
          </div>
        )}
      </div>
    </div>
  );
}
