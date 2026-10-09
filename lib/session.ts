const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

let sessionId: string | undefined;

/**
 * Opaque id that groups conversation history and keys rate limits on the backend. It is not an
 * auth token. It lives only for the page's lifetime: the assistant's conversations are kept in
 * memory and start empty on every load, so the server-side history must start fresh too —
 * otherwise the model sees (and refers to) turns the operator can no longer see.
 */
export function getSessionId(): string {
  sessionId ??= randomId();
  return sessionId;
}

/** The operator's browser language as a BCP-47 tag, e.g. "en-US". */
export function getLanguage(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const tag = navigator.language;
  return tag && /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(tag) ? tag : undefined;
}
