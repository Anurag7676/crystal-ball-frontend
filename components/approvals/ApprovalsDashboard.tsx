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
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AssistantPanel } from '@/components/assistant/AssistantPanel';
import { BrandMark } from '@/components/ui/BrandMark';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useApprovals } from '@/hooks/useApprovals';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { type Approval, type ApprovalQuery, PAGE_SIZES } from '@/lib/contracts';
import { ApprovalDetail } from './ApprovalDetail';
import { ApprovalsTable } from './ApprovalsTable';
import { STATUS_LABEL, TYPE_META } from './approvalMeta';
import { FilterMenu } from './FilterMenu';
import { Pagination } from './Pagination';

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

interface Filters {
  type: Approval['type'][];
  submittedBy: string[];
  status: Approval['status'][];
}

const NO_FILTERS: Filters = { type: [], submittedBy: [], status: [] };
const nonEmpty = <T,>(list: T[]) => (list.length ? list : undefined);

export function ApprovalsDashboard() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 250);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [selectedId, setSelectedId] = useState<string>();

  // Search, filtering and paging all happen on the server; this is just the request.
  const query = useMemo<ApprovalQuery>(
    () => ({
      q: debouncedSearch || undefined,
      type: nonEmpty(filters.type),
      submittedBy: nonEmpty(filters.submittedBy),
      status: nonEmpty(filters.status),
      page,
      pageSize,
    }),
    [debouncedSearch, filters, page, pageSize],
  );

  const result = useApprovals(query);
  const { status, data, reload } = result;
  const approvals = data?.approvals ?? [];
  const pendingCount = data?.pendingCount ?? 0;
  const selected = approvals.find((a) => a.id === selectedId) ?? approvals[0];
  const hasCriteria = Boolean(search.trim()) || Object.values(filters).some((list) => list.length > 0);

  const updateFilter = <K extends keyof Filters>(key: K, values: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: values }));
    setPage(1);
  };
  const clearAll = () => {
    setSearch('');
    setFilters(NO_FILTERS);
    setPage(1);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-fg">
      <nav aria-label="Primary" className="hidden h-full w-52 shrink-0 flex-col border-r border-line bg-surface md:flex">
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

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
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

        <main className="flex w-full flex-1 flex-col px-4 py-5 sm:px-6">
          <div className="animate-rise">
            <h1 className="text-[20px] font-semibold tracking-tight">Approvals &amp; Review</h1>
            <p className="mt-0.5 text-fg-muted">Content submitted by HelpAdmins, waiting for an operator decision.</p>
          </div>

          <div className="mt-5 grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="flex min-h-[320px] animate-rise flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card [animation-delay:40ms]">
              <div className="flex h-11 shrink-0 items-center gap-2 px-4">
                <h2 className="text-[13px] font-medium">Pending approval requests</h2>
                {data && (
                  <span className="rounded bg-surface-2 px-1.5 text-[11px] font-medium tabular-nums text-fg-muted">
                    {data.total} items
                  </span>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-1.5 px-4 pb-3">
                <label className="mr-1 flex h-7 w-full items-center gap-1.5 rounded-md border border-line bg-surface px-2 transition focus-within:border-line-strong focus-within:ring-2 focus-within:ring-[var(--ring)] sm:w-56">
                  <Search aria-hidden className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
                  <span className="sr-only">Search approvals</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search approvals…"
                    className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-fg-subtle"
                  />
                </label>
                <FilterMenu
                  label="Type"
                  options={data?.facets.type ?? []}
                  selected={filters.type}
                  onChange={(v) => updateFilter('type', v as Approval['type'][])}
                  formatValue={(v) => TYPE_META[v as Approval['type']]?.label ?? v}
                />
                <FilterMenu
                  label="Submitted by"
                  options={data?.facets.submittedBy ?? []}
                  selected={filters.submittedBy}
                  onChange={(v) => updateFilter('submittedBy', v)}
                />
                <FilterMenu
                  label="Status"
                  options={data?.facets.status ?? []}
                  selected={filters.status}
                  onChange={(v) => updateFilter('status', v as Approval['status'][])}
                  formatValue={(v) => STATUS_LABEL[v as Approval['status']] ?? v}
                />
                {hasCriteria && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    <X aria-hidden className="h-3 w-3" />
                    Clear filters
                  </button>
                )}
              </div>

              {status === 'error' && !data ? (
                <ErrorNotice className="mx-4 mb-4" message={result.error} onRetry={reload} />
              ) : (
                <>
                  {status === 'error' && <ErrorNotice className="mx-4 mb-3" message={result.error} onRetry={reload} />}
                  <ApprovalsTable
                    approvals={approvals}
                    loading={!data}
                    refreshing={status === 'loading' && Boolean(data)}
                    selectedId={selected?.id}
                    onSelect={setSelectedId}
                    onClearFilters={hasCriteria ? clearAll : undefined}
                  />
                  {data && (
                    <Pagination
                      page={data.page}
                      pageCount={data.pageCount}
                      pageSize={data.pageSize}
                      selectedPageSize={pageSize}
                      total={data.total}
                      shown={approvals.length}
                      disabled={status === 'loading'}
                      onPageChange={setPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                      }}
                    />
                  )}
                </>
              )}
            </section>

            <aside
              aria-label="Selected approval"
              className="animate-rise self-start overflow-hidden rounded-lg border border-line bg-surface shadow-card [animation-delay:80ms]"
            >
              <ApprovalDetail approval={selected} />
            </aside>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-fg-subtle">
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
