const SESSION_KEY = 'crystal-ball.sessionId';

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

let memorySessionId: string | undefined;

/**
 * Opaque per-tab id that groups conversation history and keys rate limits on the backend.
 * It is not an auth token. Storage can be unavailable (private mode), so fall back to memory.
 */
export function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = randomId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    memorySessionId ??= randomId();
    return memorySessionId;
  }
}

/** The operator's browser language as a BCP-47 tag, e.g. "en-US". */
export function getLanguage(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const tag = navigator.language;
  return tag && /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(tag) ? tag : undefined;
}
