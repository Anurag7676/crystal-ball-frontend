import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Thinking } from '@/components/ui/Thinking';
import { useAssistantStore } from '@/store/assistantStore';
import { BrandMark } from './illustrations';

export function GreetingBanner() {
  const greeting = useAssistantStore((s) => s.greeting);
  const replayGreeting = useAssistantStore((s) => s.replayGreeting);
  const busy = greeting.status === 'loading' || greeting.status === 'streaming';

  return (
    <div role="status" aria-label="Greeting" aria-busy={busy} className="mb-4">
      {greeting.status === 'error' && greeting.error ? (
        <ErrorNotice message={greeting.error.message} onRetry={greeting.error.retryable ? replayGreeting : undefined} />
      ) : (
        <div className="flex animate-rise gap-2.5">
          <BrandMark className="mt-0.5 h-7 w-7 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5 rounded-2xl rounded-tl-md border border-line bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-fg shadow-card">
            {greeting.status === 'loading' || (greeting.status === 'idle' && !greeting.text) ? (
              <Thinking />
            ) : (
              <p>
                {greeting.text}
                {greeting.status === 'streaming' && (
                  <span aria-hidden className="ml-0.5 inline-block h-4 w-[3px] animate-caret rounded-full bg-brand align-text-bottom" />
                )}
              </p>
            )}
            <SourceBadge source={greeting.source} reason={greeting.fallbackReason} />
          </div>
        </div>
      )}
    </div>
  );
}
