import { Info, Lightbulb, RotateCw } from 'lucide-react';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Thinking } from '@/components/ui/Thinking';
import { useAssistantStore } from '@/store/assistantStore';

function SummarySkeleton() {
  return (
    <div className="space-y-4">
      <Thinking label="Thinking… reviewing the queue" />
      <div className="space-y-2">
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-4/5 rounded" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton h-16 rounded-xl" />
      ))}
    </div>
  );
}

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
    <section aria-label="Queue summary" className="space-y-5 text-sm text-fg">
      <div className="flex animate-rise items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
            {data.pendingCount} pending
          </span>
          <SourceBadge source={summary.source} reason={summary.fallbackReason} />
        </div>
        <button
          type="button"
          onClick={loadSummary}
          aria-label="Refresh summary"
          title="Regenerate"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle transition hover:bg-surface-2 hover:text-fg active:rotate-180"
        >
          <RotateCw aria-hidden className="h-4 w-4" />
        </button>
      </div>

      <p className="animate-rise leading-relaxed text-fg [animation-delay:40ms]">{data.overview}</p>

      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">Suggested review order</h3>
        <ol className="space-y-2">
          {data.priorityItems.map((item, i) => (
            <li
              key={item.approvalId}
              style={{ animationDelay: `${80 + i * 60}ms` }}
              className="flex animate-rise gap-3 rounded-xl border border-line bg-surface p-3 shadow-card"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  i === 0 ? 'bg-brand text-brand-fg' : 'bg-surface-2 text-fg-muted'
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-fg">{item.title}</p>
                <p className="mt-0.5 leading-snug text-fg-muted">{item.reason}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="animate-rise [animation-delay:320ms]">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">Recommendations</h3>
        <ul className="space-y-1.5">
          {data.recommendations.map((r) => (
            <li key={r} className="flex gap-2 leading-snug text-fg-muted">
              <Lightbulb aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warm" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <p className="flex animate-rise gap-2 rounded-xl bg-warm-soft px-3 py-2.5 text-xs leading-relaxed text-warn-fg [animation-delay:380ms]">
        <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {data.orderingNote}
      </p>
    </section>
  );
}
