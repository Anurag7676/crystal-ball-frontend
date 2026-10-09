import { AlertTriangle, RotateCw } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorNotice({ message, onRetry, className = '' }: Props) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 ${className}`}
    >
      <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-500"
        >
          <RotateCw aria-hidden className="h-3 w-3" />
          Try again
        </button>
      )}
    </div>
  );
}
