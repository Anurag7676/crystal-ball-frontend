import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApprovalsDashboard } from '@/components/approvals/ApprovalsDashboard';
import { ApiError, fetchApprovals, streamAiAction } from '@/lib/api';
import type { Approval } from '@/lib/contracts';
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

beforeEach(() => {
  resetAssistantStore();
  vi.mocked(streamAiAction).mockImplementation(() => new Promise<void>(() => {}));
});

describe('ApprovalsDashboard', () => {
  it('renders the pending approvals table from the API', async () => {
    vi.mocked(fetchApprovals).mockResolvedValue({ approvals, source: 'fixture' });
    render(<ApprovalsDashboard />);

    const table = await screen.findByRole('table', { name: 'Pending approval requests' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(4);
    expect(rows[2]).toHaveTextContent('Safety Equipment & Sensor Specs');
    expect(rows[2]).toHaveTextContent('PDF');
    expect(rows[2]).toHaveTextContent('Sam HelpAdmin');
    expect(rows[2]).toHaveTextContent('Pending Review');
    expect(screen.getByText('4 items')).toBeInTheDocument();
  });

  it('filters rows with the search box', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchApprovals).mockResolvedValue({ approvals, source: 'fixture' });
    render(<ApprovalsDashboard />);
    const table = await screen.findByRole('table', { name: 'Pending approval requests' });

    await user.type(screen.getByRole('searchbox'), 'elena');

    expect(within(table).getAllByRole('row').slice(1)).toHaveLength(1);
  });

  it('shows the selected item and hands it to the assistant', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchApprovals).mockResolvedValue({ approvals, source: 'fixture' });
    render(<ApprovalsDashboard />);
    await screen.findByRole('table', { name: 'Pending approval requests' });

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
    vi.mocked(fetchApprovals).mockResolvedValue({ approvals, source: 'fixture' });
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
      .mockResolvedValueOnce({ approvals, source: 'fixture' });
    render(<ApprovalsDashboard />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not reach the server.');

    await user.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('table', { name: 'Pending approval requests' })).toBeInTheDocument();
  });
});
