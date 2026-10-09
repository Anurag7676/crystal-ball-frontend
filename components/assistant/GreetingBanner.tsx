import { AssistantAvatar } from '@/components/ui/BrandMark';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Thinking } from '@/components/ui/Thinking';
import { useAssistantStore } from '@/store/assistantStore';

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
          <AssistantAvatar className="mt-px h-5 w-5" />
          <div className="min-w-0 flex-1 space-y-1.5 text-[13px] leading-relaxed text-fg">
            {greeting.status === 'loading' || (greeting.status === 'idle' && !greeting.text) ? (
              <Thinking />
            ) : (
              <p>
                {greeting.text}
                {greeting.status === 'streaming' && (
                  <span aria-hidden className="ml-0.5 inline-block h-3.5 w-[2px] animate-caret bg-fg align-text-bottom" />
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
