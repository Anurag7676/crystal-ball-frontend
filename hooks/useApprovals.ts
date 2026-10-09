'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchApprovals } from '@/lib/api';
import type { Approval } from '@/lib/contracts';

type State =
  | { status: 'loading'; approvals: Approval[] }
  | { status: 'ready'; approvals: Approval[] }
  | { status: 'error'; approvals: Approval[]; error: string };

/** Loads the approvals queue once, with an explicit retry for the error state. */
export function useApprovals() {
  const [state, setState] = useState<State>({ status: 'loading', approvals: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchApprovals(controller.signal)
      .then((res) => setState({ status: 'ready', approvals: res.approvals }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = err instanceof ApiError ? err.message : 'Could not load approvals.';
        setState((s) => ({ status: 'error', approvals: s.approvals, error: message }));
      });
    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => {
    setState((s) => ({ status: 'loading', approvals: s.approvals }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}
