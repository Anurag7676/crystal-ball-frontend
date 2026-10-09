import { useId } from 'react';

/**
 * Duotone spot illustrations for the four action cards. Colours come from CSS tokens, so they
 * adapt to light and dark themes. Purely decorative (aria-hidden).
 */

interface Props {
  className?: string;
}

const base = { viewBox: '0 0 72 72', fill: 'none', 'aria-hidden': true } as const;

export function SummaryIllustration({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="36" cy="38" r="28" fill="var(--tint-amber)" />
      <rect x="20" y="16" width="32" height="42" rx="6" fill="var(--surface)" stroke="var(--tint-amber-fg)" strokeWidth="2.5" />
      <rect x="28" y="12" width="16" height="8" rx="3" fill="var(--tint-amber-fg)" />
      <g stroke="var(--tint-amber-fg)" strokeWidth="2.5" strokeLinecap="round">
        <path d="m25.5 29 2.2 2.2 3.8-4" />
        <path d="m25.5 39 2.2 2.2 3.8-4" />
        <path d="M35.5 29.5h10M35.5 39.5h10" />
        <path d="M25.5 49.5h20" opacity="0.4" />
      </g>
      <path
        d="M56 14c.5 2.8 1.7 4 4.5 4.5-2.8.5-4 1.7-4.5 4.5-.5-2.8-1.7-4-4.5-4.5 2.8-.5 4-1.7 4.5-4.5Z"
        fill="var(--tint-amber-fg)"
      />
    </svg>
  );
}

export function TalkIllustration({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="36" cy="38" r="28" fill="var(--tint-violet)" />
      <path
        d="M30 18h22a7 7 0 0 1 7 7v11a7 7 0 0 1-7 7h-1v6l-7-6H30a7 7 0 0 1-7-7V25a7 7 0 0 1 7-7Z"
        fill="var(--tint-violet-fg)"
        opacity="0.3"
      />
      <path
        d="M20 28h22a7 7 0 0 1 7 7v10a7 7 0 0 1-7 7H29l-8 7v-7h-1a7 7 0 0 1-7-7V35a7 7 0 0 1 7-7Z"
        fill="var(--tint-violet-fg)"
      />
      <g fill="var(--surface)">
        <circle cx="23.5" cy="40" r="2.4" />
        <circle cx="31" cy="40" r="2.4" />
        <circle cx="38.5" cy="40" r="2.4" />
      </g>
    </svg>
  );
}

export function HelpIllustration({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="36" cy="38" r="28" fill="var(--tint-sky)" />
      <circle cx="35" cy="37" r="19" fill="var(--surface)" stroke="var(--tint-sky-fg)" strokeWidth="2.5" />
      <g fill="var(--tint-sky-fg)">
        <path d="M28.4 19.2a19 19 0 0 1 13.2 0l-2.5 8.6a10 10 0 0 0-8.2 0l-2.5-8.6Z" />
        <path d="M28.4 54.8a19 19 0 0 0 13.2 0l-2.5-8.6a10 10 0 0 1-8.2 0l-2.5 8.6Z" />
        <path d="M17.2 30.4a19 19 0 0 0 0 13.2l8.6-2.5a10 10 0 0 1 0-8.2l-8.6-2.5Z" />
        <path d="M52.8 30.4a19 19 0 0 1 0 13.2l-8.6-2.5a10 10 0 0 0 0-8.2l8.6-2.5Z" />
      </g>
      <circle cx="35" cy="37" r="9" fill="none" stroke="var(--tint-sky-fg)" strokeWidth="2.5" />
      <circle cx="55" cy="17" r="8" fill="var(--tint-sky-fg)" />
      <path
        d="M52.6 15.2a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2.9-1.2 1.7"
        stroke="var(--surface)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="55" cy="21.4" r="1" fill="var(--surface)" />
    </svg>
  );
}

export function TeachIllustration({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="36" cy="38" r="28" fill="var(--tint-emerald)" />
      <path d="M36 34c-5-3.5-12-4.5-19-3.5v22c7-1 14 0 19 3.5V34Z" fill="var(--surface)" stroke="var(--tint-emerald-fg)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M36 34c5-3.5 12-4.5 19-3.5v22c-7-1-14 0-19 3.5V34Z" fill="var(--surface)" stroke="var(--tint-emerald-fg)" strokeWidth="2.5" strokeLinejoin="round" />
      <g stroke="var(--tint-emerald-fg)" strokeWidth="2" strokeLinecap="round" opacity="0.45">
        <path d="M22 38c3-.3 6 0 9 1M22 44c3-.3 6 0 9 1M41 39c3-1 6-1.3 9-1M41 45c3-1 6-1.3 9-1" />
      </g>
      <path d="M36 11 54 18l-18 7-18-7 18-7Z" fill="var(--tint-emerald-fg)" />
      <path d="M26 21.5V27c0 2.2 4.5 4 10 4s10-1.8 10-4v-5.5L36 25l-10-3.5Z" fill="var(--tint-emerald-fg)" opacity="0.7" />
      <path d="M53 18v8" stroke="var(--tint-emerald-fg)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="53" cy="27.5" r="1.8" fill="var(--tint-emerald-fg)" />
    </svg>
  );
}

/** Small brand mark used for the assistant avatar and the product logo. */
export function BrandMark({ className }: Props) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b7bff" />
          <stop offset="1" stopColor="#4a37e6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <path d="M5.5 16S10 8.5 16 8.5 26.5 16 26.5 16 22 23.5 16 23.5 5.5 16 5.5 16Z" fill="#fff" opacity="0.95" />
      <circle cx="16" cy="16" r="4.2" fill="#4a37e6" />
      <circle cx="17.4" cy="14.6" r="1.3" fill="#fff" />
    </svg>
  );
}
