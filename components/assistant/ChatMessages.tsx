import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/store/assistantStore';
import { StreamingMessage } from './StreamingMessage';

interface Props {
  messages: ChatMessage[];
  label: string;
  onRetry: () => void;
}

export function ChatMessages({ messages, label, onRetry }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const lastContent = messages.at(-1)?.content;

  // Follow the conversation as tokens arrive.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages.length, lastContent]);

  return (
    <div role="log" aria-label={label} aria-live="polite" className="flex flex-col gap-4">
      {messages.map((m, i) =>
        m.role === 'user' ? (
          <p
            key={m.id}
            className="ml-auto max-w-[85%] animate-msg-in whitespace-pre-wrap rounded-2xl rounded-tr-md bg-gradient-to-br from-brand to-brand-hover px-3.5 py-2.5 text-sm leading-relaxed text-brand-fg shadow-raised"
          >
            {m.content}
          </p>
        ) : (
          <StreamingMessage key={m.id} message={m} onRetry={i === messages.length - 1 ? onRetry : undefined} />
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}
