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
      className={`flex animate-rise items-center gap-2 rounded-md border border-danger-line bg-danger-soft px-2.5 py-2 text-[12px] text-danger ${className}`}
    >
      <AlertCircle aria-hidden className="h-3.5 w-3.5 shrink-0" />
      <p className="flex-1 leading-snug">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-6 shrink-0 items-center gap-1 rounded border border-danger-line bg-surface px-2 text-[11px] font-medium text-danger transition-colors hover:bg-danger-soft"
        >
          <RotateCw aria-hidden className="h-3 w-3" />
          Try again
        </button>
      )}
    </div>
  );
}
