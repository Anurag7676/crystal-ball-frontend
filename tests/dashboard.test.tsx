import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApprovalsDashboard } from '@/components/approvals/ApprovalsDashboard';
import { ApiError, fetchApprovals, streamAiAction } from '@/lib/api';
import type { Approval, ApprovalsResponse } from '@/lib/contracts';
import { resetAssistantStore } from '@/store/assistantStore';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, fetchApprovals: vi.fn(), streamAiAction: vi.fn(() => new Promise<void>(() => {})) };
});

const approvals: Approval[] = [
  { id: 'apr-001', title: 'Site Patrol Onboarding & Checklists', type: 'folder', submittedBy: 'Sam HelpAdmin', status: 'pending_review', submittedDateLabel: 'Sep 18' },
  { id: 'apr-002', title: 'Level 2 Drone Patrol Video Demo', type: 'video', submittedBy: 'Alex HelpAdmin', status: 'pending_review', submittedDateLabel: 'Sep 18' },
  { id: 'apr-003', title: 'Safety Equipment & Sensor Specs', type: 'pdf', submittedBy: 'Sam HelpAdmin', status: 'pending_review', submittedDateLabel: 'Sep 18' },
  { id: 'apr-004', title: '360° Spatial Zone Layout & Camera Map', type: 'image', submittedBy: 'Elena HelpAdmin', status: 'pending_review', submittedDateLabel: 'Sep 18' },
];

/** A server response page; facets always describe the whole queue, as the backend does. */
const pageOf = (rows: Approval[], overrides: Partial<ApprovalsResponse> = {}): ApprovalsResponse => ({
  approvals: rows,
  total: rows.length,
  page: 1,
  pageSize: 10,
  pageCount: 1,
  pendingCount: 4,
  source: 'fixture',
  facets: {
    type: [
      { value: 'folder', count: 1 },
      { value: 'image', count: 1 },
      { value: 'pdf', count: 1 },
      { value: 'video', count: 1 },
    ],
    submittedBy: [
      { value: 'Alex HelpAdmin', count: 1 },
      { value: 'Elena HelpAdmin', count: 1 },
      { value: 'Sam HelpAdmin', count: 2 },
    ],
    status: [{ value: 'pending_review', count: 4 }],
  },
  ...overrides,
});

const lastQuery = () => vi.mocked(fetchApprovals).mock.calls.at(-1)![0];
const table = () => screen.findByRole('table', { name: 'Pending approval requests' });
const bodyRows = (t: HTMLElement) => within(t).getAllByRole('row').slice(1);

beforeEach(() => {
  resetAssistantStore();
  vi.mocked(fetchApprovals).mockReset();
  vi.mocked(streamAiAction).mockImplementation(() => new Promise<void>(() => {}));
});

describe('ApprovalsDashboard', () => {
  it('renders the first page from the API', async () => {
    vi.mocked(fetchApprovals).mockResolvedValue(pageOf(approvals));
    render(<ApprovalsDashboard />);

    const rows = bodyRows(await table());
    expect(rows).toHaveLength(4);
    expect(rows[2]).toHaveTextContent('Safety Equipment & Sensor Specs');
    expect(rows[2]).toHaveTextContent('PDF');
    expect(rows[2]).toHaveTextContent('Sam HelpAdmin');
    expect(rows[2]).toHaveTextContent('Pending Review');
    expect(screen.getByText('4 items')).toBeInTheDocument();
    expect(lastQuery()).toEqual({ page: 1, pageSize: 10 });
  });

  it('sends the search to the server (debounced) and resets to page 1', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchApprovals).mockImplementation(async (query) =>
      query.q ? pageOf([approvals[3]!]) : pageOf(approvals),
    );
    render(<ApprovalsDashboard />);
    await table();

    await user.type(screen.getByRole('searchbox'), 'elena');

    await waitFor(() => expect(lastQuery()).toEqual({ q: 'elena', page: 1, pageSize: 10 }));
    await waitFor(async () => expect(bodyRows(await table())).toHaveLength(1));
    // Debounced: one request for the whole word, not one per keystroke.
    expect(vi.mocked(fetchApprovals).mock.calls.filter(([q]) => q.q)).toHaveLength(1);
  });

  it('filters by type through the API using server-provided facets', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchApprovals).mockImplementation(async (query) =>
      query.type?.includes('pdf') ? pageOf([approvals[2]!]) : pageOf(approvals),
    );
    render(<ApprovalsDashboard />);
    await table();

    await user.click(screen.getByRole('button', { name: /^Type/ }));
    await user.click(screen.getByRole('checkbox', { name: /PDF/ }));

    await waitFor(() => expect(lastQuery()).toEqual({ type: ['pdf'], page: 1, pageSize: 10 }));
    await waitFor(async () => expect(bodyRows(await table())).toHaveLength(1));
    expect(screen.getByRole('button', { name: /^Type/ })).toHaveTextContent('PDF');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() => expect(lastQuery()).toEqual({ page: 1, pageSize: 10 }));
  });

  it('pages through results and changes the page size on the server', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchApprovals).mockImplementation(async ({ page = 1, pageSize = 10 }) =>
      pageOf(approvals.slice((page - 1) * 2, page * 2), { total: 4, page, pageSize, pageCount: pageSize === 2 ? 2 : 1 }),
    );
    render(<ApprovalsDashboard />);
    await table();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '25');
    await waitFor(() => expect(lastQuery()).toEqual({ page: 1, pageSize: 25 }));

    vi.mocked(fetchApprovals).mockImplementation(async ({ page = 1 }) =>
      pageOf(approvals.slice((page - 1) * 2, page * 2), { total: 4, page, pageSize: 2, pageCount: 2 }),
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '10');
    await screen.findByText('Page 1 of 2');
    expect(screen.getByText('1–2 of 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() => expect(lastQuery()).toMatchObject({ page: 2 }));
    await screen.findByText('Page 2 of 2');
    expect(screen.getByText('3–4 of 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('shows an empty state with a way to clear filters', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchApprovals).mockImplementation(async (query) => (query.q ? pageOf([], { total: 0 }) : pageOf(approvals)));
    render(<ApprovalsDashboard />);
    await table();

    await user.type(screen.getByRole('searchbox'), 'cafeteria');

    expect(await screen.findByText('No approvals match these filters.')).toBeInTheDocument();
  });

  it('shows the selected item and hands it to the assistant', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchApprovals).mockResolvedValue(pageOf(approvals));
    render(<ApprovalsDashboard />);
    await table();

    await user.click(screen.getByRole('button', { name: 'Safety Equipment & Sensor Specs' }));
    const detail = screen.getByRole('complementary', { name: 'Selected approval' });
    expect(detail).toHaveTextContent('Sam HelpAdmin');
    expect(detail).toHaveTextContent('apr-003');

    await user.click(within(detail).getByRole('button', { name: 'Ask the assistant about this item' }));

    expect(vi.mocked(streamAiAction)).toHaveBeenCalledWith(
      'chat',
      expect.objectContaining({ message: 'What should I check before approving "Safety Equipment & Sensor Specs"?' }),
      expect.any(Function),
      expect.any(AbortSignal),
    );
  });

  it('toggles and remembers the colour theme', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchApprovals).mockResolvedValue(pageOf(approvals));
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    render(<ApprovalsDashboard />);

    await user.click(screen.getByRole('button', { name: 'Toggle dark theme' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Toggle dark theme' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    vi.unstubAllGlobals();
  });

  it('shows a retryable error when approvals cannot be loaded', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchApprovals)
      .mockRejectedValueOnce(new ApiError('network_error', 'Could not reach the server.'))
      .mockResolvedValueOnce(pageOf(approvals));
    render(<ApprovalsDashboard />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not reach the server.');

    await user.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await table()).toBeInTheDocument();
  });
});
