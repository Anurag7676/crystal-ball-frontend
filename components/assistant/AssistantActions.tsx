import { ClipboardList, GraduationCap, LifeBuoy, MessageSquare } from 'lucide-react';
import type { AssistantView } from '@/store/assistantStore';

const ACTIONS: { view: Exclude<AssistantView, 'home'>; label: string; hint: string; Icon: typeof ClipboardList }[] = [
  { view: 'summary', label: 'Present me Summary', hint: 'Prioritised overview of the queue', Icon: ClipboardList },
  { view: 'chat', label: 'Talk to me', hint: 'Ask anything about these approvals', Icon: MessageSquare },
  { view: 'help', label: 'Help me', hint: 'Answers from the approval policy', Icon: LifeBuoy },
  { view: 'teach', label: 'Teach me', hint: 'Step-by-step review walkthrough', Icon: GraduationCap },
];

export function AssistantActions({ onSelect }: { onSelect: (view: Exclude<AssistantView, 'home'>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ACTIONS.map(({ view, label, hint, Icon }, i) => (
        <button
          key={view}
          type="button"
          onClick={() => onSelect(view)}
          aria-label={label}
          style={{ animationDelay: `${40 + i * 30}ms` }}
          className="group flex animate-rise flex-col items-start gap-2.5 rounded-lg border border-line bg-surface p-3 text-left shadow-card transition-[border-color,background-color,box-shadow] hover:border-line-strong hover:shadow-raised"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface-2 text-fg-muted transition-colors group-hover:border-brand/30 group-hover:bg-brand-soft group-hover:text-brand">
            <Icon aria-hidden className="h-3.5 w-3.5" />
          </span>
          <span>
            <span className="block text-[12.5px] font-medium text-fg">{label}</span>
            <span aria-hidden className="mt-0.5 block text-[11px] leading-snug text-fg-subtle">
              {hint}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
