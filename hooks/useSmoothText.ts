'use client';

import { useEffect, useRef, useState } from 'react';

/** Slowest reveal speed while streaming (characters per second). */
const MIN_STREAMING_CPS = 40;
/**
 * While streaming, reveal speed is proportional to the backlog (≈0.7s time constant). The display
 * runs slightly behind the network, which spreads each burst across the gaps between bursts
 * instead of dumping it and then stalling.
 */
const CATCH_UP_RATE = 1.5;
/** Once the stream has ended, finish the buffered remainder at about twice the streaming pace. */
const MIN_DRAIN_CPS = 150;
const DRAIN_RATE = 3;

const prefersReducedMotion = () =>
  typeof window === 'undefined' ||
  typeof window.matchMedia !== 'function' ||
  typeof requestAnimationFrame !== 'function' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isHighSurrogate = (code: number) => code >= 0xd800 && code <= 0xdbff;

/**
 * Paces streamed text so it appears at a steady rate. Model output arrives in uneven bursts
 * (several deltas in the same millisecond, then a pause); rendering each burst as-is reads as
 * jerky. The reveal speeds up with the backlog, drains quickly after the stream ends, shows
 * replaced text (e.g. a server fallback) at once, and is disabled under reduced motion.
 */
export function useSmoothText(target: string, streaming: boolean): string {
  const [reduced] = useState(prefersReducedMotion);
  const [shown, setShown] = useState({ source: '', len: 0 });
  // Fractional position and the text it refers to; touched only inside the animation loop.
  const posRef = useRef(0);
  const sourceRef = useRef('');

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last: number | undefined;

    const tick = (now: number) => {
      const dt = last === undefined ? 16 : Math.min(now - last, 100);
      last = now;

      let pos = posRef.current;
      // Streaming only ever appends; anything else is a replacement — show it in full.
      if (!target.startsWith(sourceRef.current)) pos = target.length;

      const backlog = target.length - pos;
      if (backlog > 0) {
        const cps = streaming
          ? Math.max(MIN_STREAMING_CPS, backlog * CATCH_UP_RATE)
          : Math.max(MIN_DRAIN_CPS, backlog * DRAIN_RATE);
        pos = Math.min(target.length, pos + (cps * dt) / 1000);
      }
      posRef.current = pos;
      sourceRef.current = target;

      let len = Math.floor(pos);
      if (len > 0 && len < target.length && isHighSurrogate(target.charCodeAt(len - 1))) len -= 1;
      setShown({ source: target, len });

      if (pos < target.length) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, streaming, reduced]);

  if (reduced) return target;
  // A replacement (target no longer extends the text we were revealing) shows immediately.
  return target.startsWith(shown.source) ? target.slice(0, shown.len) : target;
}
