'use client';

import { ArrowLeft, Bot, Home, X } from 'lucide-react';
import { useEffect } from 'react';
import { type ConversationAction, TEACH_STARTER, useAssistantStore } from '@/store/assistantStore';
import { AssistantActions } from './AssistantActions';
import { AssistantHeader } from './AssistantHeader';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { GreetingBanner } from './GreetingBanner';
import { SummaryView } from './SummaryView';

const VIEW_TITLES = { summary: 'Summary', chat: 'Talk to me', help: 'Help me', teach: 'Teach me' } as const;

const CONVERSATION_COPY: Record<ConversationAction, { placeholder: string; starters: string[]; empty: string }> = {
  chat: {
    placeholder: 'Ask about the approvals queue…',
    starters: ['Which of these needs my attention first and why?', 'Who submitted the safety specs?'],
    empty: 'Ask anything about the four pending approvals.',
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
        {thread.messages.length === 0 && copy.empty && <p className="mb-3 text-sm text-slate-500">{copy.empty}</p>}
        <ChatMessages messages={thread.messages} label={`${VIEW_TITLES[action]} conversation`} onRetry={() => retryLast(action)} />
        {!busy && (
          <div className="mt-4 flex flex-wrap gap-2">
            {copy.starters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(action, s)}
                className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs text-violet-700 hover:bg-violet-100"
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

  useEffect(() => {
    if (isOpen) playGreetingOnce();
  }, [isOpen, playGreetingOnce]);

  const select = (next: Exclude<typeof view, 'home'>) => {
    setView(next);
    if (next === 'summary' && useAssistantStore.getState().summary.status === 'idle') loadSummary();
  };

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-label="Approvals assistant"
          className={`fixed inset-x-2 bottom-20 z-40 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl sm:inset-x-auto sm:right-6 ${
            isExpanded ? 'top-6 sm:w-[560px]' : 'max-h-[calc(100vh-7rem)] sm:h-[620px] sm:w-[400px]'
          }`}
        >
          <AssistantHeader expanded={isExpanded} onToggleExpanded={toggleExpanded} onClose={close} />

          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 text-sm">
            {view === 'home' ? (
              <span className="inline-flex items-center gap-2 text-slate-700">
                <Home aria-hidden className="h-4 w-4" /> Approvals
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setView('home')}
                aria-label="Back to actions"
                className="inline-flex items-center gap-2 text-slate-700 hover:text-violet-700"
              >
                <ArrowLeft aria-hidden className="h-4 w-4" />
                Approvals <span className="text-slate-400">/</span> {VIEW_TITLES[view]}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setView('home');
                replayGreeting();
              }}
              className="text-xs font-medium text-orange-500 hover:text-orange-600"
            >
              Replay Greeting
            </button>
          </div>

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
          {(view === 'chat' || view === 'help' || view === 'teach') && <ConversationView key={view} action={view} />}

          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
            <span>{pendingCount} pending items</span>
            <span>Suggestions only — verify before acting</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={isOpen ? close : open}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        className="fixed bottom-4 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#11163a] text-white shadow-lg hover:bg-[#1b2257] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
      >
        {isOpen ? <X aria-hidden className="h-5 w-5" /> : <Bot aria-hidden className="h-6 w-6" />}
      </button>
    </>
  );
}
