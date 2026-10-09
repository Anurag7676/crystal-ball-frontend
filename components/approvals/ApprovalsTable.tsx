import type { Approval } from '@/lib/contracts';
import { ApprovalRow } from './ApprovalRow';

const COLUMNS = ['Name', 'Type', 'Submitted by', 'Date', 'Status'];

interface Props {
  approvals: Approval[];
  /** First load: nothing to show yet. */
  loading: boolean;
  /** A newer page is loading while the current one stays visible. */
  refreshing?: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
  onClearFilters?: () => void;
}

export function ApprovalsTable({ approvals, loading, refreshing, selectedId, onSelect, onClearFilters }: Props) {
  return (
    <div className={`min-h-0 flex-1 overflow-auto transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
      <table
        aria-label="Pending approval requests"
        aria-busy={loading || refreshing}
        className="w-full min-w-[620px] text-left text-[13px]"
      >
        <thead>
          <tr className="h-8 border-y border-line bg-surface-2/50 text-[11px] font-medium text-fg-subtle">
            {COLUMNS.map((c, i) => (
              <th key={c} scope="col" className={`font-medium ${i === 0 ? 'pl-4 pr-3' : i === COLUMNS.length - 1 ? 'px-3 pr-4' : 'px-3'}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && approvals.length === 0
            ? Array.from({ length: 4 }, (_, i) => (
                <tr key={i} className="h-11 border-b border-line last:border-0">
                  <td className="pl-4 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="skeleton h-6 w-6 rounded-md" />
                      <div className="skeleton h-3 w-44 rounded" />
                    </div>
                  </td>
                  {[48, 96, 40, 88].map((w, j) => (
                    <td key={j} className="px-3">
                      <div className="skeleton h-3 rounded" style={{ width: w }} />
                    </td>
                  ))}
                </tr>
              ))
            : approvals.map((a, i) => (
                <ApprovalRow key={a.id} approval={a} index={i} selected={a.id === selectedId} onSelect={onSelect} />
              ))}
          {!loading && approvals.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center">
                <p className="text-fg">No approvals match these filters.</p>
                {onClearFilters && (
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="mt-2 text-[12px] text-fg-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    Clear search and filters
                  </button>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
