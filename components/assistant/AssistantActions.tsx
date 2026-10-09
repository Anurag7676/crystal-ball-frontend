import { ClipboardList, GraduationCap, LifeBuoy, MessagesSquare } from 'lucide-react';
import type { AssistantView } from '@/store/assistantStore';

const ACTIONS: { view: Exclude<AssistantView, 'home'>; label: string; hint: string; Icon: typeof ClipboardList; tint: string }[] = [
  { view: 'summary', label: 'Present me Summary', hint: 'Prioritised overview of the queue', Icon: ClipboardList, tint: 'from-amber-100 to-amber-200 text-amber-700' },
  { view: 'chat', label: 'Talk to me', hint: 'Ask anything about these approvals', Icon: MessagesSquare, tint: 'from-violet-100 to-violet-200 text-violet-700' },
  { view: 'help', label: 'Help me', hint: 'Answers from the approval policy', Icon: LifeBuoy, tint: 'from-sky-100 to-sky-200 text-sky-700' },
  { view: 'teach', label: 'Teach me', hint: 'Step-by-step review walkthrough', Icon: GraduationCap, tint: 'from-emerald-100 to-emerald-200 text-emerald-700' },
];

export function AssistantActions({ onSelect }: { onSelect: (view: Exclude<AssistantView, 'home'>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map(({ view, label, hint, Icon, tint }) => (
        <button
          key={view}
          type="button"
          onClick={() => onSelect(view)}
          aria-label={label}
          className="group flex flex-col items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-violet-500"
        >
          <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tint}`}>
            <Icon aria-hidden className="h-8 w-8" />
          </span>
          <span className="text-sm font-medium text-slate-800">{label}</span>
          <span aria-hidden className="text-[11px] leading-tight text-slate-500">
            {hint}
          </span>
        </button>
      ))}
    </div>
  );
}
