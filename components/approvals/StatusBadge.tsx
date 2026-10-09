import type { Approval } from '@/lib/contracts';
import { STATUS_LABEL } from './approvalMeta';

const DOT: Record<Approval['status'], string> = {
  pending_review: 'bg-warm',
  approved: 'bg-success',
  rejected: 'bg-danger',
};

export function StatusBadge({ status }: { status: Approval['status'] }) {
  return (
    <span className="inline-flex h-5 items-center gap-1.5 rounded-full border border-line bg-surface px-2 text-[11px] font-medium text-fg-muted">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
