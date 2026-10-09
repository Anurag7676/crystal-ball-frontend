'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchApprovals } from '@/lib/api';
import type { ApprovalQuery, ApprovalsResponse } from '@/lib/contracts';

interface Settled {
  /** Which request this result belongs to. */
  key: string;
  data?: ApprovalsResponse;
  error?: string;
}

/**
 * Fetches one page of approvals for `query`. A new query aborts the previous request, and the
 * last page stays on screen while the next one loads so the table doesn't flash empty.
 * Loading is derived (the latest request hasn't settled yet) rather than stored.
 */
export function useApprovals(query: ApprovalQuery) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled>({ key: '' });
  const queryKey = JSON.stringify(query);
  const requestKey = `${queryKey}#${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    fetchApprovals(JSON.parse(queryKey) as ApprovalQuery, controller.signal)
      .then((data) => setSettled({ key: requestKey, data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const error = err instanceof ApiError ? err.message : 'Could not load approvals.';
        setSettled((s) => ({ key: requestKey, data: s.data, error }));
      });
    return () => controller.abort();
  }, [queryKey, requestKey]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const status: 'loading' | 'error' | 'ready' =
    settled.key !== requestKey ? 'loading' : settled.error ? 'error' : 'ready';

  return { status, data: settled.data, error: settled.error ?? '', reload };
}
