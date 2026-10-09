import { Info, Maximize2, Minimize2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  expanded: boolean;
  onToggleExpanded: () => void;
  onClose: () => void;
}

const iconButton =
  'rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white';

export function AssistantHeader({ expanded, onToggleExpanded, onClose }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 bg-[#11163a] px-4 py-3 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner">
          <Sparkles aria-hidden className="h-5 w-5 text-[#11163a]" />
        </span>
        <h2 id="assistant-title" className="flex-1 text-base font-semibold">
          Approvals
        </h2>
        <button
          type="button"
          aria-label="About this assistant"
          aria-expanded={showInfo}
          onClick={() => setShowInfo((v) => !v)}
          className={iconButton}
        >
          <Info aria-hidden className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={expanded ? 'Shrink assistant' : 'Expand assistant'}
          onClick={onToggleExpanded}
          className={`${iconButton} hidden sm:block`}
        >
          {expanded ? <Minimize2 aria-hidden className="h-4 w-4" /> : <Maximize2 aria-hidden className="h-4 w-4" />}
        </button>
        <button type="button" aria-label="Close assistant" onClick={onClose} className={iconButton}>
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>
      {showInfo && (
        <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
          AI assistant powered by GPT-4o. It summarises and explains the queue but cannot approve or reject items.
          Answers marked “Offline answer” are standard responses used when the AI is unavailable.
        </p>
      )}
    </div>
  );
}
