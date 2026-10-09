import { Info, Maximize2, Minimize2, X } from 'lucide-react';
import { useState } from 'react';
import { BrandMark } from './illustrations';

interface Props {
  expanded: boolean;
  onToggleExpanded: () => void;
  onClose: () => void;
}

const iconButton =
  'flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-white/10 hover:text-ink-fg active:scale-90 focus-visible:outline-white';

export function AssistantHeader({ expanded, onToggleExpanded, onClose }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div>
      <div className="relative flex items-center gap-3 overflow-hidden bg-ink px-4 py-3 text-ink-fg">
        {/* soft brand glow */}
        <div aria-hidden className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-brand/40 blur-3xl" />
        <span className="relative">
          <BrandMark className="h-9 w-9 rounded-[10px] shadow-[0_0_0_2px_rgb(255_255_255/0.08)]" />
          <span aria-hidden className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink" />
        </span>
        <div className="relative min-w-0 flex-1">
          <h2 id="assistant-title" className="text-[15px] font-semibold leading-tight">
            Approvals
          </h2>
          <p className="text-[11px] text-ink-muted">AI assistant · suggestions only</p>
        </div>
        <div className="relative flex items-center gap-0.5">
          <button
            type="button"
            aria-label="About this assistant"
            aria-expanded={showInfo}
            onClick={() => setShowInfo((v) => !v)}
            className={`${iconButton} ${showInfo ? 'bg-white/10 text-ink-fg' : ''}`}
          >
            <Info aria-hidden className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={expanded ? 'Shrink assistant' : 'Expand assistant'}
            onClick={onToggleExpanded}
            className={`${iconButton} hidden sm:flex`}
          >
            {expanded ? <Minimize2 aria-hidden className="h-4 w-4" /> : <Maximize2 aria-hidden className="h-4 w-4" />}
          </button>
          <button type="button" aria-label="Close assistant" onClick={onClose} className={iconButton}>
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
      {showInfo && (
        <p className="animate-rise border-b border-line bg-brand-softer px-4 py-2.5 text-xs leading-relaxed text-fg-muted">
          Powered by GPT-4o. It summarises and explains the queue but cannot approve or reject items. Answers marked{' '}
          <span className="font-medium text-warn-fg">Offline answer</span> are standard responses used when the AI is
          unavailable.
        </p>
      )}
    </div>
  );
}
