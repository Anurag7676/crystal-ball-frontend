import { ChevronRight } from 'lucide-react';
import type { Approval } from '@/lib/contracts';
import { TYPE_META } from './approvalMeta';
import { StatusBadge } from './StatusBadge';

interface Props {
  approval: Approval;
  selected: boolean;
  index: number;
  onSelect: (id: string) => void;
}

export function ApprovalRow({ approval, selected, index, onSelect }: Props) {
  const { label, Icon, tint } = TYPE_META[approval.type];

  return (
    <tr
      onClick={() => onSelect(approval.id)}
      style={{ animationDelay: `${index * 40}ms` }}
      className={`group animate-rise cursor-pointer border-b border-line text-sm transition-colors last:border-0 ${
        selected ? 'bg-brand-softer shadow-[inset_3px_0_0_0_var(--brand)]' : 'hover:bg-surface-2'
      }`}
    >
      <td className="py-3.5 pl-5 pr-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tint}`}>
            <Icon aria-hidden className="h-[18px] w-[18px]" />
          </span>
          {/* The button gives keyboard and screen-reader users the same "select row" action. */}
          <button
            type="button"
            aria-pressed={selected}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(approval.id);
            }}
            className="rounded text-left font-medium text-fg transition-colors group-hover:text-brand"
          >
            {approval.title}
          </button>
        </div>
      </td>
      <td className="px-3 py-3.5">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-0.5 text-xs text-fg-muted">
          <Icon aria-hidden className="h-3 w-3" />
          {label}
        </span>
      </td>
      <td className="px-3 py-3.5 text-fg-muted">{approval.submittedBy}</td>
      <td className="px-3 py-3.5 tabular-nums text-fg-muted">{approval.submittedDateLabel}</td>
      <td className="px-3 py-3.5">
        <StatusBadge status={approval.status} />
      </td>
      <td className="py-3.5 pl-3 pr-5 text-right">
        <ChevronRight
          aria-hidden
          className={`ml-auto h-4 w-4 transition ${selected ? 'text-brand' : 'text-fg-subtle group-hover:translate-x-0.5 group-hover:text-fg-muted'}`}
        />
      </td>
    </tr>
  );
}
