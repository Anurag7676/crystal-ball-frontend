import { SendHorizontal, Square } from 'lucide-react';
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
    <form onSubmit={submit} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3">
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
          className="max-h-28 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 disabled:bg-slate-50"
        />
      </label>
      {busy ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop"
          className="rounded-lg bg-slate-800 p-2.5 text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-violet-500"
        >
          <Square aria-hidden className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="submit"
          aria-label="Send"
          disabled={!canSend}
          className="rounded-lg bg-violet-600 p-2.5 text-white hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-40"
        >
          <SendHorizontal aria-hidden className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
