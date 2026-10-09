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
import { BrandMark } from '@/components/assistant/illustrations';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useApprovals } from '@/hooks/useApprovals';
import { ApprovalDetail } from './ApprovalDetail';
import { ApprovalsTable } from './ApprovalsTable';

const RAIL = [
  { Icon: LayoutGrid, label: 'Dashboard' },
  { Icon: UserCheck, label: 'Approvals', active: true },
  { Icon: Users, label: 'Team' },
  { Icon: Ticket, label: 'Tickets' },
  { Icon: Store, label: 'Sites' },
  { Icon: BarChart3, label: 'Reports' },
  { Icon: FlaskConical, label: 'Labs' },
];

export function ApprovalsDashboard() {
  const { status, approvals, reload, ...rest } = useApprovals();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return approvals;
    return approvals.filter((a) =>
      [a.title, a.type, a.submittedBy, a.submittedDateLabel].some((field) => field.toLowerCase().includes(q)),
    );
  }, [approvals, query]);

  const pendingCount = approvals.filter((a) => a.status === 'pending_review').length;
  const selected = approvals.find((a) => a.id === (selectedId ?? approvals[0]?.id));

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/85 px-4 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <div>
            <p className="text-[15px] font-bold leading-tight tracking-tight">OomniEye</p>
            <p className="text-[10px] font-medium tracking-[0.14em] text-fg-subtle">DIGITAL TWIN SOLUTIONS</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Settings"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition hover:bg-surface-2 hover:text-fg sm:flex"
          >
            <Settings aria-hidden className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <Bell aria-hidden className="h-[18px] w-[18px]" />
            <span aria-hidden className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warm ring-2 ring-surface" />
          </button>
          <span
            aria-label="Signed-in operator"
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-sm font-semibold text-white shadow-card"
          >
            R
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        <nav aria-label="Primary" className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-16 flex-col items-center gap-1.5 border-r border-line bg-surface py-4 md:flex">
          <span className="mb-3 flex h-10 w-10 items-center justify-center text-fg-subtle">
            <PanelLeft aria-hidden className="h-5 w-5" />
          </span>
          {RAIL.map(({ Icon, label, active }) => (
            <span
              key={label}
              title={label}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                active ? 'bg-brand-soft text-brand' : 'text-fg-subtle hover:bg-surface-2 hover:text-fg'
              }`}
            >
              <Icon aria-hidden className="h-5 w-5" />
            </span>
          ))}
        </nav>

        <main className="min-w-0 flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
          <section className="animate-rise">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition hover:text-fg"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" /> Back to Dashboard
            </button>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Approvals &amp; Review</h1>
                <p className="mt-1 text-sm text-fg-muted">Content submitted by HelpAdmins, waiting for an operator decision.</p>
              </div>
              <label className="flex w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 shadow-card transition focus-within:border-brand focus-within:ring-4 focus-within:ring-[var(--ring)] sm:w-80">
                <Search aria-hidden className="h-4 w-4 text-fg-subtle" />
                <span className="sr-only">Search approvals</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, author or type…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-fg-subtle"
                />
              </label>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="animate-rise overflow-hidden rounded-2xl border border-line bg-surface shadow-card [animation-delay:60ms]">
              <div className="flex items-center justify-between gap-2 px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-fg">
                  <ListFilter aria-hidden className="h-4 w-4 text-brand" />
                  Pending approval requests
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold normal-case tracking-normal text-brand">
                    {pendingCount} items
                  </span>
                </h2>
              </div>

              {status === 'error' && 'error' in rest ? (
                <ErrorNotice className="mx-5 mb-5" message={rest.error} onRetry={reload} />
              ) : (
                <ApprovalsTable
                  approvals={filtered}
                  loading={status === 'loading'}
                  selectedId={selected?.id}
                  onSelect={setSelectedId}
                />
              )}
            </section>

            <aside
              aria-label="Selected approval"
              className="animate-rise self-start rounded-2xl border border-line bg-surface shadow-card [animation-delay:120ms]"
            >
              <ApprovalDetail approval={selected} />
            </aside>
          </div>
        </main>
      </div>

      <footer className="flex justify-between border-t border-line bg-surface px-6 py-2 text-xs text-fg-subtle">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status === 'error' ? 'bg-danger' : 'bg-emerald-500'}`} />
          {status === 'loading' ? 'Loading…' : status === 'error' ? 'Offline' : 'Ready'}
        </span>
        <span>Crystal Ball take-home · not an OomniEye product</span>
      </footer>

      <AssistantPanel pendingCount={pendingCount} />
    </div>
  );
}
