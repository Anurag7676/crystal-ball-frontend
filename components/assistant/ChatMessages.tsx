import { useCallback, useEffect, useRef } from 'react';
import type { ChatMessage } from '@/store/assistantStore';
import { StreamingMessage } from './StreamingMessage';

interface Props {
  messages: ChatMessage[];
  label: string;
  onRetry: () => void;
}

export function ChatMessages({ messages, label, onRetry }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, []);

  // Follow the conversation as messages are added; the last reply also scrolls as it is revealed.
  useEffect(() => {
    scrollToEnd();
  }, [messages.length, scrollToEnd]);

  return (
    <div role="log" aria-label={label} aria-live="polite" className="flex flex-col gap-5">
      {messages.map((m, i) =>
        m.role === 'user' ? (
          <p
            key={m.id}
            className="ml-auto max-w-[85%] animate-rise whitespace-pre-wrap rounded-lg bg-surface-2 px-3 py-2 text-[13px] leading-relaxed text-fg"
          >
            {m.content}
          </p>
        ) : (
          <StreamingMessage
            key={m.id}
            message={m}
            onRetry={i === messages.length - 1 ? onRetry : undefined}
            onReveal={i === messages.length - 1 ? scrollToEnd : undefined}
          />
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}
