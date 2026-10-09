import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  sessionStorage.clear();
  vi.resetModules();
});

/** A fresh module instance stands in for a new page load. */
const loadSession = async () => (await import('@/lib/session')).getSessionId;

describe('getSessionId', () => {
  it('is stable for the lifetime of the page', async () => {
    const getSessionId = await loadSession();
    expect(getSessionId()).toBe(getSessionId());
    expect(getSessionId()).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
  });

  it('starts a new conversation on every page load (the UI starts empty, so the server history must too)', async () => {
    const first = (await loadSession())();
    vi.resetModules();
    const second = (await loadSession())();

    expect(second).not.toBe(first);
  });

  it('ignores a session id left in sessionStorage by an earlier page', async () => {
    sessionStorage.setItem('crystal-ball.sessionId', 'stale-session-from-earlier');

    const id = (await loadSession())();

    expect(id).not.toBe('stale-session-from-earlier');
  });
});
