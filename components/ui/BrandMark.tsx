import { Sparkles } from 'lucide-react';

/** Product mark: monochrome tile that inverts with the theme. */
export function BrandMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-md bg-fg text-bg ${className}`}>
      <svg viewBox="0 0 16 16" fill="none" className="h-[62%] w-[62%]">
        <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}

/** Assistant avatar used next to AI messages. */
export function AssistantAvatar({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-md bg-brand text-brand-fg ${className}`}>
      <Sparkles className="h-[60%] w-[60%]" strokeWidth={2.2} />
    </span>
  );
}
