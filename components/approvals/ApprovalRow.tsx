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
  const { label, Icon } = TYPE_META[approval.type];

  return (
    <tr
      onClick={() => onSelect(approval.id)}
      style={{ animationDelay: `${index * 30}ms` }}
      className={`group h-11 animate-rise cursor-pointer border-b border-line transition-colors last:border-0 ${
        selected ? 'bg-surface-2' : 'hover:bg-surface-2/60'
      }`}
    >
      <td className="relative pl-4 pr-3">
        {selected && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-r bg-brand" />}
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-fg-muted">
            <Icon aria-hidden className="h-3.5 w-3.5" />
          </span>
          {/* The button gives keyboard and screen-reader users the same "select row" action. */}
          <button
            type="button"
            aria-pressed={selected}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(approval.id);
            }}
            className="truncate rounded-sm text-left font-medium text-fg"
          >
            {approval.title}
          </button>
        </div>
      </td>
      <td className="px-3 text-fg-muted">{label}</td>
      <td className="px-3 text-fg-muted">{approval.submittedBy}</td>
      <td className="px-3 tabular-nums text-fg-muted">{approval.submittedDateLabel}</td>
      <td className="px-3 pr-4">
        <StatusBadge status={approval.status} />
      </td>
    </tr>
  );
}
