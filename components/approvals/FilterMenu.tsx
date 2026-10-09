'use client';

import { Check, ChevronDown, PlusCircle } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { Facet } from '@/lib/contracts';

interface Props {
  label: string;
  options: Facet;
  selected: string[];
  onChange: (next: string[]) => void;
  formatValue?: (value: string) => string;
}

/** Multi-select facet filter. Options and counts come from the server's whole-queue facets. */
export function FilterMenu({ label, options, selected, onChange, formatValue = (v) => v }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const active = selected.length > 0;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);

  const summary =
    selected.length === 1 ? formatValue(selected[0]!) : selected.length > 1 ? `${selected.length} selected` : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[12px] transition-colors ${
          active
            ? 'border-line-strong bg-surface-2 text-fg'
            : 'border-dashed border-line-strong text-fg-muted hover:bg-surface-2 hover:text-fg'
        }`}
      >
        {!active && <PlusCircle aria-hidden className="h-3.5 w-3.5" />}
        {label}
        {summary && (
          <>
            <span aria-hidden className="h-3.5 w-px bg-line-strong" />
            <span className="font-medium">{summary}</span>
          </>
        )}
        <ChevronDown aria-hidden className="h-3 w-3 text-fg-subtle" />
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={`Filter by ${label.toLowerCase()}`}
          className="absolute left-0 top-full z-20 mt-1 w-56 animate-rise rounded-lg border border-line bg-surface p-1 shadow-float"
        >
          {options.length === 0 && <p className="px-2 py-1.5 text-[12px] text-fg-subtle">No options</p>}
          {options.map(({ value, count }) => {
            const checked = selected.includes(value);
            return (
              <label
                key={value}
                className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-[12.5px] text-fg hover:bg-surface-2"
              >
                <input type="checkbox" checked={checked} onChange={() => toggle(value)} className="peer sr-only" />
                <span
                  aria-hidden
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)] ${
                    checked ? 'border-fg bg-fg text-bg' : 'border-line-strong bg-surface'
                  }`}
                >
                  {checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <span className="flex-1 truncate">{formatValue(value)}</span>
                <span className="font-mono text-[11px] tabular-nums text-fg-subtle">{count}</span>
              </label>
            );
          })}
          {active && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 h-7 w-full rounded-md border-t border-line text-[12px] text-fg-muted hover:bg-surface-2 hover:text-fg"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
