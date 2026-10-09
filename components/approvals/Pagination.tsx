import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZES } from '@/lib/contracts';

interface Props {
  page: number;
  pageCount: number;
  /** Page size the server applied (used for the visible range). */
  pageSize: number;
  /** Page size currently selected in the control. */
  selectedPageSize: number;
  total: number;
  shown: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const navButton =
  'flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40 disabled:hover:bg-surface';

/** Server-driven pagination footer: range, rows per page, and previous/next. */
export function Pagination({
  page,
  pageCount,
  pageSize,
  selectedPageSize,
  total,
  shown,
  disabled,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = total === 0 ? 0 : start + shown - 1;

  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-t border-line px-4 text-[12px] text-fg-muted">
      <span className="tabular-nums">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="hidden sm:inline">Rows per page</span>
          <select
            aria-label="Rows per page"
            value={selectedPageSize}
            disabled={disabled}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-7 rounded-md border border-line bg-surface px-1.5 text-[12px] text-fg outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <span className="tabular-nums">
          Page {page} of {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={navButton}
          >
            <ChevronLeft aria-hidden className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Next page"
            disabled={disabled || page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className={navButton}
          >
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
