import { Sparkles } from 'lucide-react';
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
        <div className="flex gap-2 rounded-xl bg-gradient-to-r from-violet-50 to-amber-50 px-3 py-2.5">
          <Sparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
          <div className="min-w-0 flex-1 space-y-1 text-sm text-slate-700">
            {greeting.status === 'loading' || (greeting.status === 'idle' && !greeting.text) ? (
              <Thinking />
            ) : (
              <p>
                {greeting.text}
                {greeting.status === 'streaming' && (
                  <span aria-hidden className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-violet-500 align-middle" />
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
