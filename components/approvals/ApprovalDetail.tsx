import { GraduationCap, MessagesSquare, MousePointerClick } from 'lucide-react';
import type { Approval } from '@/lib/contracts';
import { useAssistantStore } from '@/store/assistantStore';
import { TYPE_META } from './approvalMeta';
import { StatusBadge } from './StatusBadge';

/** Selected-item panel, as in the reference screen. Shows only fields that exist in the data. */
export function ApprovalDetail({ approval }: { approval?: Approval }) {
  const askAbout = useAssistantStore((s) => s.askAbout);

  if (!approval) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-fg-muted">
        <MousePointerClick aria-hidden className="h-6 w-6 text-fg-subtle" />
        Select an approval to see its details.
      </div>
    );
  }

  const { label, Icon, tint } = TYPE_META[approval.type];
  const fields = [
    ['Submitted by', approval.submittedBy],
    ['Submitted', approval.submittedDateLabel],
    ['Type', label],
    ['Reference', approval.id],
  ];

  return (
    <div key={approval.id} className="animate-view-in p-5">
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tint}`}>
        <Icon aria-hidden className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold leading-snug text-fg">{approval.title}</h2>
      <div className="mt-2">
        <StatusBadge status={approval.status} />
      </div>

      <dl className="mt-5 divide-y divide-line rounded-xl border border-line">
        {fields.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
            <dt className="text-fg-muted">{k}</dt>
            <dd className="font-medium text-fg">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={() =>
            askAbout('chat', `What should I check before approving "${approval.title}"?`)
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-brand-fg shadow-raised transition hover:bg-brand-hover active:scale-[0.98]"
        >
          <MessagesSquare aria-hidden className="h-4 w-4" />
          Ask the assistant about this item
        </button>
        <button
          type="button"
          onClick={() => askAbout('teach')}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-fg transition hover:bg-surface-2 active:scale-[0.98]"
        >
          <GraduationCap aria-hidden className="h-4 w-4" />
          How do I review this?
        </button>
      </div>
    </div>
  );
}
