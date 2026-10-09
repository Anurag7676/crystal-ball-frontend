'use client';

import {
  ArrowLeft,
  BarChart3,
  Bell,
  FlaskConical,
  LayoutGrid,
  ListFilter,
  PanelLeft,
  Search,
  Settings,
  Store,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AssistantPanel } from '@/components/assistant/AssistantPanel';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { useApprovals } from '@/hooks/useApprovals';
import { ApprovalsTable } from './ApprovalsTable';

const RAIL_ICONS = [LayoutGrid, UserCheck, Users, Ticket, Store, BarChart3, FlaskConical];

export function ApprovalsDashboard() {
  const { status, approvals, reload, ...rest } = useApprovals();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return approvals;
    return approvals.filter((a) =>
      [a.title, a.type, a.submittedBy, a.submittedDateLabel].some((field) => field.toLowerCase().includes(q)),
    );
  }, [approvals, query]);

  const pendingCount = approvals.filter((a) => a.status === 'pending_review').length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div>
          <p className="text-lg font-bold leading-tight">OomniEye</p>
          <p className="text-[11px] tracking-wide text-slate-600">DIGITAL TWIN SOLUTIONS</p>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <Settings aria-hidden className="hidden h-5 w-5 sm:block" />
          <Bell aria-hidden className="h-5 w-5" />
          <span
            aria-label="Signed-in operator"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 font-semibold text-white"
          >
            R
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        <nav aria-label="Primary" className="hidden w-16 flex-col items-center gap-6 border-r border-slate-200 bg-white py-5 md:flex">
          <PanelLeft aria-hidden className="h-5 w-5 text-slate-500" />
          {RAIL_ICONS.map((Icon, i) => (
            <Icon key={i} aria-hidden className={`h-5 w-5 ${i === 0 ? 'text-blue-500' : 'text-slate-400'}`} />
          ))}
        </nav>

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600">
                <ArrowLeft aria-hidden className="h-4 w-4" /> Back to Dashboard
              </span>
              <h1 className="text-lg font-semibold">Approvals &amp; Review</h1>
            </div>
            <label className="mt-4 flex max-w-xl items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:ring-2 focus-within:ring-violet-300">
              <Search aria-hidden className="h-4 w-4 text-slate-400" />
              <span className="sr-only">Search approvals</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search approvals by title, author, folder, or page..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
                <ListFilter aria-hidden className="h-4 w-4 text-violet-600" />
                Pending approval requests
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-normal normal-case text-slate-600">
                  {pendingCount} items
                </span>
              </h2>
            </div>

            {status === 'error' && 'error' in rest ? (
              <ErrorNotice className="m-4" message={rest.error} onRetry={reload} />
            ) : (
              <ApprovalsTable approvals={filtered} loading={status === 'loading'} />
            )}
          </section>
        </main>
      </div>

      <footer className="flex justify-between border-t border-slate-200 bg-white px-6 py-2 text-xs text-slate-500">
        <span>{status === 'loading' ? 'Loading…' : 'Ready'}</span>
        <span>Crystal Ball take-home · not an OomniEye product</span>
      </footer>

      <AssistantPanel pendingCount={pendingCount} />
    </div>
  );
}
