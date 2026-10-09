import { AlertCircle, RotateCw } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorNotice({ message, onRetry, className = '' }: Props) {
  return (
    <div
      role="alert"
      className={`flex animate-rise items-start gap-2.5 rounded-xl border border-danger-line bg-danger-soft px-3 py-2.5 text-sm text-danger ${className}`}
    >
      <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1 leading-snug">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-danger shadow-card ring-1 ring-danger-line transition hover:bg-danger-soft active:scale-95"
        >
          <RotateCw aria-hidden className="h-3 w-3" />
          Try again
        </button>
      )}
    </div>
  );
}
