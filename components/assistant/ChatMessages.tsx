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
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, lastContent]);

  return (
    <div role="log" aria-label={label} aria-live="polite" className="flex flex-col gap-3">
      {messages.map((m, i) =>
        m.role === 'user' ? (
          <p
            key={m.id}
            className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-violet-600 px-3 py-2 text-sm text-white"
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
