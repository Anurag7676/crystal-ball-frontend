import type { Approval } from '@/lib/contracts';
import { STATUS_LABEL } from './approvalMeta';

export function StatusBadge({ status }: { status: Approval['status'] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-soft px-2.5 py-0.5 text-xs font-medium text-warn-fg">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warm" />
      {STATUS_LABEL[status]}
    </span>
  );
}
