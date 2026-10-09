'use client';

import {
  BarChart3,
  Bell,
  ChevronRight,
  FlaskConical,
  LayoutGrid,
  Search,
  Settings,
  Store,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AssistantPanel } from '@/components/assistant/AssistantPanel';
import { BrandMark } from '@/components/ui/BrandMark';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useApprovals } from '@/hooks/useApprovals';
import { ApprovalDetail } from './ApprovalDetail';
import { ApprovalsTable } from './ApprovalsTable';

const NAV = [
  { Icon: LayoutGrid, label: 'Dashboard' },
  { Icon: UserCheck, label: 'Approvals', active: true },
  { Icon: Users, label: 'Team' },
  { Icon: Ticket, label: 'Tickets' },
  { Icon: Store, label: 'Sites' },
  { Icon: BarChart3, label: 'Reports' },
  { Icon: FlaskConical, label: 'Labs' },
];

const iconButton =
  'flex h-7 w-7 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg';

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
    <div className="flex min-h-screen bg-bg text-fg">
      <nav aria-label="Primary" className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="flex h-12 items-center gap-2 border-b border-line px-3.5">
          <BrandMark className="h-6 w-6" />
          <div className="leading-none">
            <p className="text-[13px] font-semibold tracking-tight">OomniEye</p>
            <p className="mt-0.5 text-[10px] text-fg-subtle">Digital Twin Solutions</p>
          </div>
        </div>
        <ul className="flex-1 space-y-px p-2">
          {NAV.map(({ Icon, label, active }) => (
            <li key={label}>
              <span
                aria-current={active ? 'page' : undefined}
                className={`flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors ${
                  active ? 'bg-surface-2 font-medium text-fg' : 'text-fg-muted hover:bg-surface-2/70 hover:text-fg'
                }`}
              >
                <Icon aria-hidden className="h-4 w-4" strokeWidth={1.8} />
                {label}
                {active && (
                  <span className="ml-auto rounded bg-surface px-1.5 text-[10.5px] font-medium tabular-nums text-fg-muted ring-1 ring-line">
                    {pendingCount}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 border-t border-line p-3">
          <span
            aria-label="Signed-in operator"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-3 text-[11px] font-semibold text-fg"
          >
            R
          </span>
          <span className="text-[12px] text-fg-muted">Operator</span>
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-1.5 text-[13px]">
            <BrandMark className="h-5 w-5 md:hidden" />
            <span className="text-fg-muted">Dashboard</span>
            <ChevronRight aria-hidden className="h-3.5 w-3.5 text-fg-subtle" />
            <span className="font-medium text-fg">Approvals &amp; Review</span>
          </div>
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <button type="button" aria-label="Settings" className={iconButton}>
              <Settings aria-hidden className="h-[15px] w-[15px]" />
            </button>
            <button type="button" aria-label="Notifications" className={`relative ${iconButton}`}>
              <Bell aria-hidden className="h-[15px] w-[15px]" />
              <span aria-hidden className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <div className="flex animate-rise flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight">Approvals &amp; Review</h1>
              <p className="mt-0.5 text-fg-muted">Content submitted by HelpAdmins, waiting for an operator decision.</p>
            </div>
            <label className="flex h-8 w-full items-center gap-2 rounded-md border border-line bg-surface px-2.5 shadow-card transition focus-within:border-line-strong focus-within:ring-2 focus-within:ring-[var(--ring)] sm:w-64">
              <Search aria-hidden className="h-3.5 w-3.5 text-fg-subtle" />
              <span className="sr-only">Search approvals</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search approvals…"
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-fg-subtle"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="animate-rise overflow-hidden rounded-lg border border-line bg-surface shadow-card [animation-delay:40ms]">
              <div className="flex h-11 items-center gap-2 px-4">
                <h2 className="text-[13px] font-medium">Pending approval requests</h2>
                <span className="rounded bg-surface-2 px-1.5 text-[11px] font-medium tabular-nums text-fg-muted">
                  {pendingCount} items
                </span>
              </div>

              {status === 'error' && 'error' in rest ? (
                <ErrorNotice className="mx-4 mb-4" message={rest.error} onRetry={reload} />
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
              className="animate-rise self-start overflow-hidden rounded-lg border border-line bg-surface shadow-card [animation-delay:80ms]"
            >
              <ApprovalDetail approval={selected} />
            </aside>
          </div>

          <p className="mt-6 flex items-center gap-1.5 text-[11px] text-fg-subtle">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${status === 'error' ? 'bg-danger' : status === 'loading' ? 'bg-warm' : 'bg-success'}`}
            />
            {status === 'loading' ? 'Loading…' : status === 'error' ? 'Offline' : 'Ready'}
            <span className="mx-1">·</span>
            Crystal Ball take-home — not an OomniEye product
          </p>
        </main>
      </div>

      <AssistantPanel pendingCount={pendingCount} />
    </div>
  );
}
