import { ArrowUpRight, GraduationCap } from 'lucide-react';
import type { Approval } from '@/lib/contracts';
import { useAssistantStore } from '@/store/assistantStore';
import { TYPE_META } from './approvalMeta';
import { StatusBadge } from './StatusBadge';

/** Selected-item panel, as in the reference screen. Shows only fields that exist in the data. */
export function ApprovalDetail({ approval }: { approval?: Approval }) {
  const askAbout = useAssistantStore((s) => s.askAbout);

  if (!approval) {
    return <p className="p-4 text-fg-muted">Select an approval to see its details.</p>;
  }

  const { label, Icon } = TYPE_META[approval.type];
  const fields: [string, React.ReactNode][] = [
    ['Status', <StatusBadge key="s" status={approval.status} />],
    ['Type', label],
    ['Submitted by', approval.submittedBy],
    ['Submitted', approval.submittedDateLabel],
    ['Reference', <span key="r" className="font-mono text-[12px]">{approval.id}</span>],
  ];

  return (
    <div key={approval.id} className="animate-view-in">
      <div className="border-b border-line p-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-surface-2 text-fg-muted">
          <Icon aria-hidden className="h-4 w-4" />
        </span>
        <h2 className="mt-3 text-[14px] font-semibold leading-snug tracking-tight text-fg">{approval.title}</h2>
      </div>

      <dl className="space-y-2.5 p-4">
        {fields.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3">
            <dt className="text-fg-subtle">{k}</dt>
            <dd className="text-right text-fg">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-1.5 border-t border-line p-4">
        <button
          type="button"
          onClick={() => askAbout('chat', `What should I check before approving "${approval.title}"?`)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-fg px-3 text-[12.5px] font-medium text-bg transition-opacity hover:opacity-85"
        >
          Ask the assistant about this item
          <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => askAbout('teach', `How do I review "${approval.title}"?`)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] font-medium text-fg transition-colors hover:bg-surface-2"
        >
          <GraduationCap aria-hidden className="h-3.5 w-3.5 text-fg-muted" />
          How do I review this?
        </button>
      </div>
    </div>
  );
}
