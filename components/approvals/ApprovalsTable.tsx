import type { Approval } from '@/lib/contracts';
import { ApprovalRow } from './ApprovalRow';

const COLUMNS = ['Folder / Content name', 'Type', 'Submitted by', 'Date', 'Status', 'Actions'];

interface Props {
  approvals: Approval[];
  loading: boolean;
}

export function ApprovalsTable({ approvals, loading }: Props) {
  return (
    <div className="overflow-x-auto">
      <table aria-label="Pending approval requests" aria-busy={loading} className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
            {COLUMNS.map((c, i) => (
              <th key={c} scope="col" className={`py-2 font-medium ${i === 0 ? 'pl-4 pr-3' : 'px-3'} ${i === 5 ? 'text-right' : ''}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && approvals.length === 0
            ? Array.from({ length: 4 }, (_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))
            : approvals.map((a, i) => <ApprovalRow key={a.id} approval={a} highlighted={i === 0} />)}
          {!loading && approvals.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                No approvals match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
