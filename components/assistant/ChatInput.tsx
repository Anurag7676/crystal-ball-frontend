import { ArrowUp, Square } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useState } from 'react';
import { MAX_MESSAGE_LENGTH } from '@/lib/contracts';

interface Props {
  busy: boolean;
  placeholder: string;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function ChatInput({ busy, placeholder, onSend, onStop }: Props) {
  const [text, setText] = useState('');
  const canSend = !busy && text.trim().length > 0;
  const nearLimit = text.length > MAX_MESSAGE_LENGTH * 0.8;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e);
  };

  return (
    <form onSubmit={submit} className="p-3 pt-0">
      <div className="rounded-lg border border-line bg-surface shadow-card transition focus-within:border-line-strong focus-within:ring-2 focus-within:ring-[var(--ring)]">
        <label className="block">
          <span className="sr-only">Message</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder={placeholder}
            className="field-sizing-content block max-h-28 min-h-9 w-full resize-none bg-transparent px-3 pt-2.5 text-[13px] text-fg outline-none placeholder:text-fg-subtle disabled:opacity-60"
          />
        </label>
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="flex items-center gap-1 pl-1 text-[10.5px] text-fg-subtle">
            {nearLimit ? (
              <span className="tabular-nums">
                {text.length}/{MAX_MESSAGE_LENGTH}
              </span>
            ) : (
              <>
                <span className="kbd">↵</span> send <span className="kbd ml-1">⇧↵</span> new line
              </>
            )}
          </span>
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop"
              className="flex h-6 w-6 items-center justify-center rounded-md bg-fg text-bg transition-opacity hover:opacity-80"
            >
              <Square aria-hidden className="h-2.5 w-2.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send"
              disabled={!canSend}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-fg text-bg transition-opacity hover:opacity-80 disabled:bg-surface-3 disabled:text-fg-subtle"
            >
              <ArrowUp aria-hidden className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
