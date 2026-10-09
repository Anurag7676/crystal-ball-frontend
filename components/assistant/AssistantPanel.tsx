'use client';

import { ChevronLeft, RotateCcw, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type ConversationAction, TEACH_STARTER, useAssistantStore } from '@/store/assistantStore';
import { AssistantActions } from './AssistantActions';
import { AssistantHeader } from './AssistantHeader';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { GreetingBanner } from './GreetingBanner';
import { SummaryView } from './SummaryView';

const VIEW_TITLES = { summary: 'Summary', chat: 'Talk to me', help: 'Help me', teach: 'Teach me' } as const;
const CLOSE_ANIMATION_MS = 140;

const CONVERSATION_COPY: Record<ConversationAction, { placeholder: string; starters: string[]; empty: string }> = {
  chat: {
    placeholder: 'Ask about the approvals queue…',
    starters: ['Which of these needs my attention first and why?', 'Who submitted the safety specs?'],
    empty: 'Ask anything about the pending approvals.',
  },
  help: {
    placeholder: 'Ask an approval-policy question…',
    starters: ['What should I check before approving a video?', 'Can I review an item I submitted myself?'],
    empty: 'Answers come only from the approval policy, with section references.',
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
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {thread.messages.length === 0 && copy.empty && (
          <p className="mb-4 animate-rise text-[12.5px] text-fg-muted">{copy.empty}</p>
        )}
        <ChatMessages messages={thread.messages} label={`${VIEW_TITLES[action]} conversation`} onRetry={() => retryLast(action)} />
        {!busy && (
          <div className="mt-5 flex flex-col items-start gap-1.5">
            {copy.starters.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(action, s)}
                style={{ animationDelay: `${i * 40}ms` }}
                className="animate-rise rounded-md border border-line bg-surface px-2.5 py-1 text-left text-[12px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
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
          className={`fixed inset-x-2 bottom-[72px] z-40 flex origin-bottom-right flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-float sm:inset-x-auto sm:right-5 ${
            closing ? 'animate-panel-out' : 'animate-panel-in'
          } ${isExpanded ? 'top-16 sm:w-[520px]' : 'max-h-[calc(100vh-6rem)] sm:h-[600px] sm:w-[380px]'}`}
        >
          <AssistantHeader expanded={isExpanded} onToggleExpanded={toggleExpanded} onClose={requestClose} />

          <div className="flex h-9 items-center justify-between border-b border-line px-3 text-[12px]">
            {view === 'home' ? (
              <span className="px-1 font-medium text-fg">Approvals</span>
            ) : (
              <button
                type="button"
                onClick={() => setView('home')}
                aria-label="Back to actions"
                className="-ml-0.5 inline-flex h-6 items-center gap-0.5 rounded-md pl-0.5 pr-1.5 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <ChevronLeft aria-hidden className="h-3.5 w-3.5" />
                Approvals <span className="px-1 text-fg-subtle">/</span>
                <span className="font-medium text-fg">{VIEW_TITLES[view]}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setView('home');
                replayGreeting();
              }}
              className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <RotateCcw aria-hidden className="h-3 w-3" />
              Replay Greeting
            </button>
          </div>

          <div key={view} className="flex min-h-0 flex-1 animate-view-in flex-col bg-bg/40">
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

          <div className="flex h-8 items-center justify-between border-t border-line px-3 text-[11px] text-fg-subtle">
            <span className="tabular-nums">{pendingCount} pending items</span>
            <span>Suggestions only — verify before acting</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={visible ? requestClose : open}
        aria-label={visible ? 'Close assistant' : 'Open assistant'}
        className="fixed bottom-4 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-fg text-bg shadow-float transition-transform hover:scale-105 active:scale-95"
      >
        <span className="grid place-items-center">
          <X
            aria-hidden
            className={`col-start-1 row-start-1 h-4 w-4 transition duration-200 ${visible ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}
          />
          <Sparkles
            aria-hidden
            className={`col-start-1 row-start-1 h-4 w-4 transition duration-200 ${visible ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
          />
        </span>
      </button>
    </>
  );
}
