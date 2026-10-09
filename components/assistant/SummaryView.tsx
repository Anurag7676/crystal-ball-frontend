import { RotateCw } from 'lucide-react';
import { ErrorNotice } from '@/components/ui/ErrorNotice';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Thinking } from '@/components/ui/Thinking';
import { useAssistantStore } from '@/store/assistantStore';

/** Renders the Zod-validated structured summary — never raw model text. */
export function SummaryView() {
  const summary = useAssistantStore((s) => s.summary);
  const loadSummary = useAssistantStore((s) => s.loadSummary);

  if (summary.status === 'loading' || summary.status === 'idle') {
    return <Thinking label="Thinking… reviewing the queue" />;
  }
  if (summary.status === 'error' || !summary.data) {
    return <ErrorNotice message={summary.error?.message ?? 'Could not build a summary.'} onRetry={loadSummary} />;
  }

  const { data } = summary;
  return (
    <section aria-label="Queue summary" className="space-y-4 text-sm text-slate-700">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          {data.pendingCount} pending
        </span>
        <div className="flex items-center gap-2">
          <SourceBadge source={summary.source} reason={summary.fallbackReason} />
          <button
            type="button"
            onClick={loadSummary}
            aria-label="Refresh summary"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <RotateCw aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="leading-relaxed">{data.overview}</p>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested review order</h3>
        <ol className="space-y-2">
          {data.priorityItems.map((item, i) => (
            <li key={item.approvalId} className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
              <p className="font-medium text-slate-800">
                {i + 1}. {item.title}
              </p>
              <p className="mt-1 text-slate-600">{item.reason}</p>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recommendations</h3>
        <ul className="list-disc space-y-1 pl-5">
          {data.recommendations.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{data.orderingNote}</p>
    </section>
  );
}
