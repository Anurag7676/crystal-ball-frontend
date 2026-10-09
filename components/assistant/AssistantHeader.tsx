import { Info, Maximize2, Minimize2, X } from 'lucide-react';
import { useState } from 'react';
import { AssistantAvatar } from '@/components/ui/BrandMark';

interface Props {
  expanded: boolean;
  onToggleExpanded: () => void;
  onClose: () => void;
}

const iconButton =
  'flex h-7 w-7 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg';

export function AssistantHeader({ expanded, onToggleExpanded, onClose }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="border-b border-line">
      <div className="flex h-11 items-center gap-2.5 px-3">
        <AssistantAvatar className="h-6 w-6" />
        <div className="min-w-0 flex-1 leading-none">
          <h2 id="assistant-title" className="text-[13px] font-semibold tracking-tight text-fg">
            Approvals
          </h2>
          <p className="mt-1 flex items-center gap-1 text-[10.5px] text-fg-subtle">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
            AI assistant
          </p>
        </div>
        <button
          type="button"
          aria-label="About this assistant"
          aria-expanded={showInfo}
          onClick={() => setShowInfo((v) => !v)}
          className={`${iconButton} ${showInfo ? 'bg-surface-2 text-fg' : ''}`}
        >
          <Info aria-hidden className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={expanded ? 'Shrink assistant' : 'Expand assistant'}
          onClick={onToggleExpanded}
          className={`${iconButton} hidden sm:flex`}
        >
          {expanded ? <Minimize2 aria-hidden className="h-3.5 w-3.5" /> : <Maximize2 aria-hidden className="h-3.5 w-3.5" />}
        </button>
        <button type="button" aria-label="Close assistant" onClick={onClose} className={iconButton}>
          <X aria-hidden className="h-3.5 w-3.5" />
        </button>
      </div>
      {showInfo && (
        <p className="animate-rise border-t border-line bg-surface-2/60 px-3 py-2 text-[11.5px] leading-relaxed text-fg-muted">
          Powered by GPT-4o. It summarises and explains the queue but cannot approve or reject items. Answers marked
          “Offline answer” are standard responses used when the AI is unavailable.
        </p>
      )}
    </div>
  );
}
