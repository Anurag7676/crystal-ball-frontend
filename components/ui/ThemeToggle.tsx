'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';

const STORAGE_KEY = 'theme';

const effectiveTheme = () => {
  const pinned = document.documentElement.dataset.theme;
  if (pinned === 'light' || pinned === 'dark') return pinned;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Light/dark toggle. By default the OS preference applies through CSS alone; choosing a theme
 * pins html[data-theme] and remembers it. Icons swap via the `dark:` variant — no React state.
 */
export function ThemeToggle() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
    } catch {
      // storage unavailable — follow the OS preference
    }
  }, []);

  const toggle = () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // the choice just won't persist
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark theme"
      title="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition hover:bg-surface-2 hover:text-fg active:scale-95"
    >
      <Moon aria-hidden className="h-[18px] w-[18px] dark:hidden" />
      <Sun aria-hidden className="hidden h-[18px] w-[18px] dark:block" />
    </button>
  );
}
