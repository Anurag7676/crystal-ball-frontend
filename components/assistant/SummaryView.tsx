import { RotateCw } from 'lucide-react';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Thinking } from '@/components/ui/Thinking';
import { useAssistantStore } from '@/store/assistantStore';

function SummarySkeleton() {
  return (
    <div className="space-y-4">
      <Thinking label="Thinking… reviewing the queue" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
      <div className="space-y-px overflow-hidden rounded-lg border border-line">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-12" />
        ))}
      </div>
    </div>
  );
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-2 text-[11px] font-medium text-fg-subtle">{children}</h3>
);

/** Renders the Zod-validated structured summary — never raw model text. */
export function SummaryView() {
  const summary = useAssistantStore((s) => s.summary);
  const loadSummary = useAssistantStore((s) => s.loadSummary);

  if (summary.status === 'loading' || summary.status === 'idle') return <SummarySkeleton />;
  if (summary.status === 'error' || !summary.data) {
    return <ErrorNotice message={summary.error?.message ?? 'Could not build a summary.'} onRetry={loadSummary} />;
  }

  const { data } = summary;
  return (
    <section aria-label="Queue summary" className="space-y-5 text-[13px] text-fg">
      <div className="flex animate-rise items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold tabular-nums">{data.pendingCount} pending</span>
          <SourceBadge source={summary.source} reason={summary.fallbackReason} />
        </div>
        <button
          type="button"
          onClick={loadSummary}
          aria-label="Refresh summary"
          title="Regenerate"
          className="flex h-7 w-7 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <RotateCw aria-hidden className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="animate-rise leading-relaxed text-fg-muted [animation-delay:30ms]">{data.overview}</p>

      <div className="animate-rise [animation-delay:60ms]">
        <SectionLabel>Suggested review order</SectionLabel>
        <ol className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {data.priorityItems.map((item, i) => (
            <li key={item.approvalId} className="flex gap-3 px-3 py-2.5">
              <span className="w-4 shrink-0 pt-px text-[12px] font-medium tabular-nums text-fg-subtle">{i + 1}</span>
              <div className="min-w-0">
                <p className="font-medium text-fg">{item.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-fg-muted">{item.reason}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="animate-rise [animation-delay:90ms]">
        <SectionLabel>Recommendations</SectionLabel>
        <ul className="space-y-1.5">
          {data.recommendations.map((r) => (
            <li key={r} className="flex gap-2 text-[12.5px] leading-snug text-fg-muted">
              <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-fg-subtle" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <p className="animate-rise border-l-2 border-warm pl-3 text-[11.5px] leading-relaxed text-fg-muted [animation-delay:120ms]">
        {data.orderingNote}
      </p>
    </section>
  );
}
