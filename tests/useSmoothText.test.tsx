import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSmoothText } from '@/hooks/useSmoothText';

const motionAllowed = () => vi.stubGlobal('matchMedia', () => ({ matches: false }));
const frames = (n: number) => act(() => vi.advanceTimersByTime(16 * n));

beforeEach(() => vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] }));
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useSmoothText', () => {
  it('reveals a burst of streamed text gradually instead of all at once', () => {
    motionAllowed();
    const burst = 'Welcome back! You have four approvals waiting for review today.';
    const { result } = renderHook(({ text }) => useSmoothText(text, true), { initialProps: { text: burst } });

    frames(1);
    const afterOneFrame = result.current.length;
    expect(afterOneFrame).toBeGreaterThan(0);
    expect(afterOneFrame).toBeLessThan(burst.length);

    frames(3);
    expect(result.current.length).toBeGreaterThan(afterOneFrame);
    expect(burst.startsWith(result.current)).toBe(true);
  });

  it('keeps up with new deltas and catches up quickly when a backlog builds', () => {
    motionAllowed();
    const { result, rerender } = renderHook(({ text }) => useSmoothText(text, true), { initialProps: { text: 'Hi' } });
    frames(5);
    expect(result.current).toBe('Hi');

    const long = `Hi${' there'.repeat(80)}`;
    rerender({ text: long });
    frames(60); // ~1s
    expect(result.current).toBe(long);
  });

  it('drains the rest promptly once streaming has finished', () => {
    motionAllowed();
    const text = 'x'.repeat(300);
    const { result, rerender } = renderHook(({ streaming }) => useSmoothText(text, streaming), {
      initialProps: { streaming: true },
    });
    frames(2);
    expect(result.current.length).toBeLessThan(300);

    rerender({ streaming: false });
    frames(15); // ~250ms
    expect(result.current).toBe(text);
  });

  it('shows replacement text (e.g. a server fallback) immediately instead of animating it', () => {
    motionAllowed();
    const { result, rerender } = renderHook(({ text }) => useSmoothText(text, true), {
      initialProps: { text: 'Welcome to the queue, here is' },
    });
    frames(3);

    rerender({ text: 'Welcome back. You have 4 pending approvals.' });

    expect(result.current).toBe('Welcome back. You have 4 pending approvals.');
  });

  it('respects prefers-reduced-motion by rendering text as it arrives', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { result } = renderHook(() => useSmoothText('Instant text', true));
    expect(result.current).toBe('Instant text');
  });

  it('never splits a multi-byte character mid-reveal', () => {
    motionAllowed();
    const text = '✅✅✅ 360° zone 🚁🚁';
    const { result } = renderHook(() => useSmoothText(text, true));
    for (let i = 0; i < 20; i++) {
      frames(1);
      expect(result.current).not.toMatch(/[\uD800-\uDBFF]$/);
    }
  });
});
