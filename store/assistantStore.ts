import { create } from 'zustand';
import { ApiError, streamAiAction } from '@/lib/api';
import type { AiAction, AiStreamEvent, FallbackReason, Summary } from '@/lib/contracts';
import { getLanguage, getSessionId } from '@/lib/session';

export type ConversationAction = 'chat' | 'help' | 'teach';
export type AssistantView = 'home' | 'summary' | ConversationAction;
export type RequestStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

export interface UiError {
  message: string;
  retryable: boolean;
}

/** Where an answer came from — shown to the operator so fallbacks are never mistaken for AI output. */
export interface AnswerSource {
  source?: 'ai' | 'fallback';
  fallbackReason?: FallbackReason;
}

export interface ChatMessage extends AnswerSource {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'streaming' | 'done' | 'error' | 'cancelled';
  sources?: string[];
  error?: UiError;
}

interface Thread {
  messages: ChatMessage[];
  status: RequestStatus;
}

interface TextResult extends AnswerSource {
  status: RequestStatus;
  text: string;
  error?: UiError;
}

interface SummaryResult extends AnswerSource {
  status: RequestStatus;
  data?: Summary;
  error?: UiError;
}

interface AssistantState {
  isOpen: boolean;
  isExpanded: boolean;
  view: AssistantView;
  greeting: TextResult;
  summary: SummaryResult;
  threads: Record<ConversationAction, Thread>;

  open(): void;
  close(): void;
  toggleExpanded(): void;
  setView(view: AssistantView): void;
  /** Plays the greeting only if it has never been requested (safe under StrictMode double effects). */
  playGreetingOnce(): void;
  replayGreeting(): void;
  loadSummary(): void;
  sendMessage(action: ConversationAction, text: string): void;
  retryLast(action: ConversationAction): void;
  cancel(action: AiAction): void;
}

export const TEACH_STARTER = 'Teach me how to review an approval.';

const emptyThread = (): Thread => ({ messages: [], status: 'idle' });

const initialData = () => ({
  isOpen: true,
  isExpanded: false,
  view: 'home' as AssistantView,
  greeting: { status: 'idle', text: '' } as TextResult,
  summary: { status: 'idle' } as SummaryResult,
  threads: { chat: emptyThread(), help: emptyThread(), teach: emptyThread() },
});

// Abort controllers live outside React state: they are not renderable and must not be cloned.
const controllers = new Map<AiAction, AbortController>();

function startRequest(action: AiAction): AbortSignal {
  controllers.get(action)?.abort();
  const controller = new AbortController();
  controllers.set(action, controller);
  return controller.signal;
}

const isAbort = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';

const toUiError = (err: unknown): UiError =>
  err instanceof ApiError
    ? { message: err.message, retryable: err.retryable }
    : { message: 'Something went wrong. Please try again.', retryable: true };

let nextId = 0;
const newId = () => `m${++nextId}`;

export const useAssistantStore = create<AssistantState>()((set, get) => {
  const requestBody = () => ({ sessionId: getSessionId(), language: getLanguage() });

  /** Runs a text-producing action (greeting) and folds its events into `greeting`. */
  async function runGreeting() {
    const signal = startRequest('greeting');
    set({ greeting: { status: 'loading', text: '' } });
    const patch = (p: Partial<TextResult>) => set((s) => ({ greeting: { ...s.greeting, ...p } }));
    try {
      await streamAiAction(
        'greeting',
        requestBody(),
        (e) => {
          if (e.event === 'delta') patch({ status: 'streaming', text: get().greeting.text + e.data.text });
          else if (e.event === 'result' && e.data.kind === 'text') patch({ text: e.data.text });
          else if (e.event === 'error') patch({ status: 'error', error: { message: e.data.message, retryable: e.data.retryable } });
          else if (e.event === 'done') patch({ status: 'done', ...e.data });
        },
        signal,
      );
    } catch (err) {
      if (isAbort(err)) return;
      patch({ status: 'error', error: toUiError(err) });
    }
  }

  function updateThread(action: ConversationAction, fn: (t: Thread) => Partial<Thread>) {
    set((s) => ({ threads: { ...s.threads, [action]: { ...s.threads[action], ...fn(s.threads[action]) } } }));
  }

  function updateMessage(action: ConversationAction, id: string, fn: (m: ChatMessage) => Partial<ChatMessage>) {
    updateThread(action, (t) => ({ messages: t.messages.map((m) => (m.id === id ? { ...m, ...fn(m) } : m)) }));
  }

  return {
    ...initialData(),

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),
    setView: (view) => set({ view }),

    playGreetingOnce: () => {
      if (get().greeting.status === 'idle') void runGreeting();
    },
    replayGreeting: () => void runGreeting(),

    loadSummary: async () => {
      const signal = startRequest('summary');
      set({ summary: { status: 'loading' } });
      const patch = (p: Partial<SummaryResult>) => set((s) => ({ summary: { ...s.summary, ...p } }));
      try {
        await streamAiAction(
          'summary',
          requestBody(),
          (e: AiStreamEvent) => {
            if (e.event === 'result' && e.data.kind === 'summary') patch({ data: e.data.summary });
            else if (e.event === 'error') patch({ status: 'error', error: { message: e.data.message, retryable: e.data.retryable } });
            else if (e.event === 'done') patch({ status: get().summary.data ? 'done' : 'error', ...e.data });
          },
          signal,
        );
      } catch (err) {
        if (isAbort(err)) return;
        patch({ status: 'error', error: toUiError(err) });
      }
    },

    sendMessage: async (action, rawText) => {
      const text = rawText.trim();
      const thread = get().threads[action];
      if (!text || thread.status === 'loading' || thread.status === 'streaming') return;

      const signal = startRequest(action);
      const replyId = newId();
      updateThread(action, (t) => ({
        status: 'loading',
        messages: [
          ...t.messages,
          { id: newId(), role: 'user', content: text, status: 'done' },
          { id: replyId, role: 'assistant', content: '', status: 'streaming' },
        ],
      }));

      try {
        await streamAiAction(
          action,
          { ...requestBody(), message: text },
          (e) => {
            switch (e.event) {
              case 'meta':
                if (e.data.sources) updateMessage(action, replyId, () => ({ sources: e.data.sources }));
                break;
              case 'delta':
                updateThread(action, () => ({ status: 'streaming' }));
                updateMessage(action, replyId, (m) => ({ content: m.content + e.data.text }));
                break;
              case 'result':
                if (e.data.kind === 'text') {
                  const replacement = e.data.text;
                  updateMessage(action, replyId, () => ({ content: replacement }));
                }
                break;
              case 'error':
                updateMessage(action, replyId, () => ({
                  status: 'error',
                  error: { message: e.data.message, retryable: e.data.retryable },
                }));
                updateThread(action, () => ({ status: 'error' }));
                break;
              case 'done':
                updateMessage(action, replyId, () => ({ status: 'done', ...e.data }));
                updateThread(action, () => ({ status: 'done' }));
                break;
            }
          },
          signal,
        );
      } catch (err) {
        if (isAbort(err)) {
          updateMessage(action, replyId, () => ({ status: 'cancelled' }));
          updateThread(action, () => ({ status: 'idle' }));
          return;
        }
        updateMessage(action, replyId, () => ({ status: 'error', error: toUiError(err) }));
        updateThread(action, () => ({ status: 'error' }));
      }
    },

    retryLast: (action) => {
      const messages = get().threads[action].messages;
      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      if (!lastUser) return;
      // Drop the failed exchange, then resend the same question.
      const index = messages.lastIndexOf(lastUser);
      updateThread(action, () => ({ messages: messages.slice(0, index), status: 'idle' }));
      void get().sendMessage(action, lastUser.content);
    },

    cancel: (action) => {
      controllers.get(action)?.abort();
      controllers.delete(action);
    },
  };
});

/** Test helper: abort in-flight requests and restore the initial state. */
export function resetAssistantStore() {
  controllers.forEach((c) => c.abort());
  controllers.clear();
  useAssistantStore.setState(initialData());
}
