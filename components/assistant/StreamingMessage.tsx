import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Thinking } from '@/components/ui/Thinking';
import type { ChatMessage } from '@/store/assistantStore';

interface Props {
  message: ChatMessage;
  onRetry?: () => void;
}

/** One assistant reply: thinking → tokens with a caret → final text, fallback badge, or error. */
export function StreamingMessage({ message, onRetry }: Props) {
  const streaming = message.status === 'streaming';

  return (
    <div className="max-w-[90%] space-y-1.5">
      {(message.content || !streaming) && message.status !== 'error' && (
        <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm leading-relaxed text-slate-800">
          {message.content}
          {streaming && <span aria-hidden className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-violet-500 align-middle" />}
        </div>
      )}
      {streaming && !message.content && <Thinking />}
      {message.status === 'error' && message.error && (
        <ErrorNotice message={message.error.message} onRetry={message.error.retryable ? onRetry : undefined} />
      )}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        {message.status === 'cancelled' && <span>Stopped</span>}
        <SourceBadge source={message.source} reason={message.fallbackReason} />
        {message.status === 'done' && message.sources && message.sources.length > 0 && (
          <span>Sources: {message.sources.join(', ')}</span>
        )}
      </div>
    </div>
  );
}
