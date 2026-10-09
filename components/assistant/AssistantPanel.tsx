'use client';

import { ChevronLeft, Home, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type ConversationAction, TEACH_STARTER, useAssistantStore } from '@/store/assistantStore';
import { AssistantActions } from './AssistantActions';
import { AssistantHeader } from './AssistantHeader';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { GreetingBanner } from './GreetingBanner';
import { SummaryView } from './SummaryView';

const VIEW_TITLES = { summary: 'Summary', chat: 'Talk to me', help: 'Help me', teach: 'Teach me' } as const;
const CLOSE_ANIMATION_MS = 160;

const CONVERSATION_COPY: Record<ConversationAction, { placeholder: string; starters: string[]; empty: string }> = {
  chat: {
    placeholder: 'Ask about the approvals queue…',
    starters: ['Which of these needs my attention first and why?', 'Who submitted the safety specs?'],
    empty: 'Ask anything about the pending approvals.',
  },
  help: {
    placeholder: 'Ask an approval-policy question…',
    starters: ['What should I check before approving a video?', 'Can I review an item I submitted myself?'],
    empty: 'Answers come only from the approval policy document, with section references.',
  },
  teach: {
    placeholder: 'Ask a follow-up, e.g. “Explain step two again”',
    starters: ['Explain step two again, more simply.', 'What do I do if I am unsure about a safety item?'],
    empty: '',
  },
};

function ConversationView({ action }: { action: ConversationAction }) {
  const thread = useAssistantStore((s) => s.threads[action]);
  const sendMessage = useAssistantStore((s) => s.sendMessage);
  const retryLast = useAssistantStore((s) => s.retryLast);
  const cancel = useAssistantStore((s) => s.cancel);
  const copy = CONVERSATION_COPY[action];
  const busy = thread.status === 'loading' || thread.status === 'streaming';

  // "Teach me" starts the lesson immediately; the other modes wait for a question.
  useEffect(() => {
    const { threads } = useAssistantStore.getState();
    if (action === 'teach' && threads.teach.messages.length === 0 && threads.teach.status === 'idle') {
      sendMessage('teach', TEACH_STARTER);
    }
  }, [action, sendMessage]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        {thread.messages.length === 0 && copy.empty && (
          <div className="mb-4 flex animate-rise gap-2 rounded-xl bg-brand-softer px-3 py-2.5 text-sm text-fg-muted">
            <Sparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            {copy.empty}
          </div>
        )}
        <ChatMessages messages={thread.messages} label={`${VIEW_TITLES[action]} conversation`} onRetry={() => retryLast(action)} />
        {!busy && (
          <div className="mt-4 flex flex-wrap gap-2">
            {copy.starters.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(action, s)}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-rise rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-fg-muted shadow-card transition hover:border-brand/40 hover:bg-brand-softer hover:text-brand active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <ChatInput
        busy={busy}
        placeholder={copy.placeholder}
        onSend={(text) => sendMessage(action, text)}
        onStop={() => cancel(action)}
      />
    </>
  );
}

export function AssistantPanel({ pendingCount }: { pendingCount: number }) {
  const isOpen = useAssistantStore((s) => s.isOpen);
  const isExpanded = useAssistantStore((s) => s.isExpanded);
  const view = useAssistantStore((s) => s.view);
  const { open, close, toggleExpanded, setView, playGreetingOnce, replayGreeting, loadSummary } =
    useAssistantStore.getState();
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isOpen) playGreetingOnce();
  }, [isOpen, playGreetingOnce]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Play the exit animation, then unmount.
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      close();
      setClosing(false);
    }, CLOSE_ANIMATION_MS);
  };

  const select = (next: Exclude<typeof view, 'home'>) => {
    setView(next);
    if (next === 'summary' && useAssistantStore.getState().summary.status === 'idle') loadSummary();
  };

  const visible = isOpen && !closing;

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-label="Approvals assistant"
          className={`fixed inset-x-2 bottom-20 z-40 flex origin-bottom-right flex-col overflow-hidden rounded-3xl border border-line bg-bg shadow-float transition-[width,top,height] duration-300 sm:inset-x-auto sm:right-6 ${
            closing ? 'animate-panel-out' : 'animate-panel-in'
          } ${isExpanded ? 'top-20 sm:w-[560px]' : 'max-h-[calc(100vh-7rem)] sm:h-[640px] sm:w-[400px]'}`}
        >
          <AssistantHeader expanded={isExpanded} onToggleExpanded={toggleExpanded} onClose={requestClose} />

          <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2 text-sm">
            {view === 'home' ? (
              <span className="inline-flex items-center gap-2 font-medium text-fg">
                <Home aria-hidden className="h-4 w-4 text-fg-subtle" /> Approvals
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setView('home')}
                aria-label="Back to actions"
                className="group -ml-1.5 inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-fg-muted transition hover:bg-surface-2 hover:text-fg"
              >
                <ChevronLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Approvals <span className="text-fg-subtle">/</span>
                <span className="font-medium text-fg">{VIEW_TITLES[view]}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setView('home');
                replayGreeting();
              }}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-warm transition hover:bg-warm-soft active:scale-95"
            >
              Replay Greeting
            </button>
          </div>

          <div key={view} className="flex min-h-0 flex-1 animate-view-in flex-col">
            {view === 'home' && (
              <div className="flex-1 overflow-y-auto p-4">
                <GreetingBanner />
                <AssistantActions onSelect={select} />
              </div>
            )}
            {view === 'summary' && (
              <div className="flex-1 overflow-y-auto p-4">
                <SummaryView />
              </div>
            )}
            {(view === 'chat' || view === 'help' || view === 'teach') && <ConversationView action={view} />}
          </div>

          <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-2 text-[11px] text-fg-subtle">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warm" />
              {pendingCount} pending items
            </span>
            <span>Suggestions only — verify before acting</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={visible ? requestClose : open}
        aria-label={visible ? 'Close assistant' : 'Open assistant'}
        className="group fixed bottom-4 right-6 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-[#8b7bff] to-[#4a37e6] text-white shadow-float transition hover:scale-105 active:scale-95"
      >
        {!visible && <span aria-hidden className="absolute inset-0 animate-ping-soft rounded-full bg-brand" />}
        <span className="relative grid place-items-center">
          <X
            aria-hidden
            className={`col-start-1 row-start-1 h-5 w-5 transition duration-300 ${visible ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}
          />
          <Sparkles
            aria-hidden
            className={`col-start-1 row-start-1 h-6 w-6 transition duration-300 ${visible ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
          />
        </span>
      </button>
    </>
  );
}
