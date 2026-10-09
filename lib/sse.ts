export interface RawSseEvent {
  event: string;
  data: string;
}

/**
 * Incremental Server-Sent Events parser for fetch() streams (EventSource can't POST).
 * - TextDecoder in streaming mode keeps multi-byte UTF-8 characters intact across chunks.
 * - Events are only emitted once their terminating blank line arrives, so partial chunks are buffered.
 */
export function createSseParser(onEvent: (event: RawSseEvent) => void) {
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const dispatch = (block: string) => {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (!line || line.startsWith(':')) continue; // comment / keep-alive
      const colon = line.indexOf(':');
      const field = colon === -1 ? line : line.slice(0, colon);
      let value = colon === -1 ? '' : line.slice(colon + 1);
      if (value.startsWith(' ')) value = value.slice(1);
      if (field === 'event') event = value;
      else if (field === 'data') data.push(value);
    }
    if (data.length) onEvent({ event, data: data.join('\n') });
  };

  const drain = (final = false) => {
    // Hold back a trailing "\r": its "\n" may arrive in the next chunk (CRLF split across chunks).
    const heldCr = !final && buffer.endsWith('\r');
    buffer = (heldCr ? buffer.slice(0, -1) : buffer).replace(/\r\n?/g, '\n') + (heldCr ? '\r' : '');
    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      dispatch(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf('\n\n');
    }
  };

  return {
    push(chunk: Uint8Array) {
      buffer += decoder.decode(chunk, { stream: true });
      drain();
    },
    /** Call at end of stream. A trailing event without its blank line is incomplete and dropped. */
    flush() {
      buffer += decoder.decode();
      drain(true);
      buffer = '';
    },
  };
}
