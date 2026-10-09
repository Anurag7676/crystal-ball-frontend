import { BookOpen, CircleSlash } from 'lucide-react';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Thinking } from '@/components/ui/Thinking';
import type { ChatMessage } from '@/store/assistantStore';
import { BrandMark } from './illustrations';

interface Props {
  message: ChatMessage;
  onRetry?: () => void;
}

/** Verified citations when the model cited any; otherwise the policy context it was given. */
function SourcesLine({ message }: { message: ChatMessage }) {
  const ids = message.citedSources?.length ? message.citedSources : message.sources;
  if (!ids?.length) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <BookOpen aria-hidden className="h-3 w-3" />
      {message.citedSources?.length ? 'Sources: ' : 'Policy context: '}
      {ids.map((id, i) => (
        <span key={id} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
          {id}
          {i < ids.length - 1 && <span className="sr-only">, </span>}
        </span>
      ))}
    </span>
  );
}

/** One assistant reply: thinking → tokens with a caret → final text, fallback badge, or error. */
export function StreamingMessage({ message, onRetry }: Props) {
  const streaming = message.status === 'streaming';

  return (
    <div className="flex max-w-[92%] animate-msg-in gap-2.5">
      <BrandMark className="mt-0.5 h-7 w-7 shrink-0" />
      <div className="min-w-0 flex-1 space-y-1.5">
        {(message.content || !streaming) && message.status !== 'error' && (
          <div className="whitespace-pre-wrap rounded-2xl rounded-tl-md border border-line bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-fg shadow-card">
            {message.content}
            {streaming && (
              <span aria-hidden className="ml-0.5 inline-block h-4 w-[3px] animate-caret rounded-full bg-brand align-text-bottom" />
            )}
          </div>
        )}
        {streaming && !message.content && (
          <div className="inline-flex rounded-2xl rounded-tl-md border border-line bg-surface px-3.5 py-2.5 shadow-card">
            <Thinking />
          </div>
        )}
        {message.status === 'error' && message.error && (
          <ErrorNotice message={message.error.message} onRetry={message.error.retryable ? onRetry : undefined} />
        )}
        <div className="flex flex-wrap items-center gap-2 pl-1 text-[11px] text-fg-subtle">
          {message.status === 'cancelled' && (
            <span className="inline-flex items-center gap-1">
              <CircleSlash aria-hidden className="h-3 w-3" />
              Stopped
            </span>
          )}
          <SourceBadge source={message.source} reason={message.fallbackReason} />
          {message.status === 'done' && message.source === 'ai' && <SourcesLine message={message} />}
        </div>
      </div>
    </div>
  );
}
