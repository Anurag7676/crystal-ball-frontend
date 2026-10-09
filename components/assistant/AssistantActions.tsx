import type { ComponentType } from 'react';
import type { AssistantView } from '@/store/assistantStore';
import { HelpIllustration, SummaryIllustration, TalkIllustration, TeachIllustration } from './illustrations';

const ACTIONS: {
  view: Exclude<AssistantView, 'home'>;
  label: string;
  hint: string;
  Art: ComponentType<{ className?: string }>;
}[] = [
  { view: 'summary', label: 'Present me Summary', hint: 'Prioritised overview of the queue', Art: SummaryIllustration },
  { view: 'chat', label: 'Talk to me', hint: 'Ask anything about these approvals', Art: TalkIllustration },
  { view: 'help', label: 'Help me', hint: 'Answers from the approval policy', Art: HelpIllustration },
  { view: 'teach', label: 'Teach me', hint: 'Step-by-step review walkthrough', Art: TeachIllustration },
];

export function AssistantActions({ onSelect }: { onSelect: (view: Exclude<AssistantView, 'home'>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map(({ view, label, hint, Art }, i) => (
        <button
          key={view}
          type="button"
          onClick={() => onSelect(view)}
          aria-label={label}
          style={{ animationDelay: `${80 + i * 50}ms` }}
          className="group flex animate-rise flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-3 pb-4 pt-5 text-center shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-raised active:translate-y-0 active:scale-[0.98]"
        >
          <Art className="h-16 w-16 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110" />
          <span className="mt-1 text-sm font-semibold text-fg">{label}</span>
          <span aria-hidden className="text-[11px] leading-snug text-fg-muted">
            {hint}
          </span>
        </button>
      ))}
    </div>
  );
}
