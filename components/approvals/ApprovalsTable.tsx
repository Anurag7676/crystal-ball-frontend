import { SearchX } from 'lucide-react';
import type { Approval } from '@/lib/contracts';
import { ApprovalRow } from './ApprovalRow';

const COLUMNS = ['Folder / Content name', 'Type', 'Submitted by', 'Date', 'Status', ''];

interface Props {
  approvals: Approval[];
  loading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ApprovalsTable({ approvals, loading, selectedId, onSelect }: Props) {
  return (
    <div className="overflow-x-auto">
      <table aria-label="Pending approval requests" aria-busy={loading} className="w-full min-w-[680px] text-left">
        <thead>
          <tr className="border-b border-line bg-surface-2/60 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
            {COLUMNS.map((c, i) => (
              <th key={i} scope="col" className={`py-2.5 font-semibold ${i === 0 ? 'pl-5 pr-3' : i === 5 ? 'pr-5' : 'px-3'}`}>
                {c || <span className="sr-only">Open</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && approvals.length === 0
            ? Array.from({ length: 4 }, (_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="py-4 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="skeleton h-9 w-9 rounded-xl" />
                      <div className="skeleton h-3.5 w-48 rounded" />
                    </div>
                  </td>
                  {[16, 24, 12, 24].map((w, j) => (
                    <td key={j} className="px-3 py-4">
                      <div className="skeleton h-3.5 rounded" style={{ width: `${w * 4}px` }} />
                    </td>
                  ))}
                  <td />
                </tr>
              ))
            : approvals.map((a, i) => (
                <ApprovalRow key={a.id} approval={a} index={i} selected={a.id === selectedId} onSelect={onSelect} />
              ))}
          {!loading && approvals.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-sm text-fg-muted">
                <SearchX aria-hidden className="mx-auto mb-2 h-6 w-6 text-fg-subtle" />
                No approvals match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
