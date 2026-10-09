import { describe, expect, it } from 'vitest';
import { createSseParser, type RawSseEvent } from '@/lib/sse';

const encoder = new TextEncoder();

function parseChunks(chunks: (string | Uint8Array)[]) {
  const events: RawSseEvent[] = [];
  const parser = createSseParser((e) => events.push(e));
  for (const chunk of chunks) parser.push(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
  parser.flush();
  return events;
}

describe('SSE parser', () => {
  it('parses several events delivered in a single network chunk', () => {
    const events = parseChunks([
      'event: meta\ndata: {"a":1}\n\nevent: delta\ndata: {"text":"Hi"}\n\nevent: done\ndata: {}\n\n',
    ]);
    expect(events).toEqual([
      { event: 'meta', data: '{"a":1}' },
      { event: 'delta', data: '{"text":"Hi"}' },
      { event: 'done', data: '{}' },
    ]);
  });

  it('reassembles an event split across arbitrary chunk boundaries', () => {
    const events = parseChunks(['ev', 'ent: del', 'ta\nda', 'ta: {"text":', '"Hello"}\n', '\n']);
    expect(events).toEqual([{ event: 'delta', data: '{"text":"Hello"}' }]);
  });

  it('does not corrupt multi-byte UTF-8 characters split between chunks', () => {
    const bytes = encoder.encode('event: delta\ndata: {"text":"360° zone ✅"}\n\n');
    const degree = bytes.indexOf(0xc2); // first byte of "°"
    const events = parseChunks([bytes.slice(0, degree + 1), bytes.slice(degree + 1)]);
    expect(JSON.parse(events[0]!.data)).toEqual({ text: '360° zone ✅' });
  });

  it('handles CRLF line endings, comments and multi-line data', () => {
    const events = parseChunks([': keep-alive\r\n\r\nevent: delta\r\ndata: line1\r\ndata: line2\r\n\r\n']);
    expect(events).toEqual([{ event: 'delta', data: 'line1\nline2' }]);
  });

  it('defaults the event name to "message"', () => {
    expect(parseChunks(['data: x\n\n'])).toEqual([{ event: 'message', data: 'x' }]);
  });

  it('drops an incomplete trailing event when the stream is cut off', () => {
    const events = parseChunks(['event: delta\ndata: {"text":"ok"}\n\nevent: delta\ndata: {"te']);
    expect(events).toEqual([{ event: 'delta', data: '{"text":"ok"}' }]);
  });
});
