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
    <form onSubmit={submit} className="border-t border-line bg-surface p-3">
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface-2 p-1.5 pl-3 transition focus-within:border-brand focus-within:bg-surface focus-within:ring-4 focus-within:ring-[var(--ring)]">
        <label className="flex-1">
          <span className="sr-only">Message</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder={placeholder}
            className="field-sizing-content block max-h-28 min-h-9 w-full resize-none bg-transparent py-2 text-sm text-fg outline-none placeholder:text-fg-subtle disabled:opacity-60"
          />
        </label>
        {busy ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fg text-bg transition hover:opacity-85 active:scale-90"
          >
            <Square aria-hidden className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            aria-label="Send"
            disabled={!canSend}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-fg shadow-raised transition hover:bg-brand-hover active:scale-90 disabled:bg-surface-3 disabled:text-fg-subtle disabled:shadow-none"
          >
            <ArrowUp aria-hidden className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-1.5 flex justify-between px-1 text-[10px] text-fg-subtle">
        <span>Enter to send · Shift+Enter for a new line</span>
        {nearLimit && (
          <span className="tabular-nums">
            {text.length}/{MAX_MESSAGE_LENGTH}
          </span>
        )}
      </p>
    </form>
  );
}
