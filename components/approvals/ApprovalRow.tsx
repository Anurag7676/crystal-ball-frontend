import { FileText, Folder, Image as ImageIcon, MoreVertical, Video } from 'lucide-react';
import type { Approval } from '@/lib/contracts';

const TYPE_META: Record<Approval['type'], { label: string; Icon: typeof Folder; tint: string }> = {
  folder: { label: 'Folder', Icon: Folder, tint: 'bg-amber-50 text-amber-600' },
  video: { label: 'Video', Icon: Video, tint: 'bg-rose-50 text-rose-600' },
  pdf: { label: 'PDF', Icon: FileText, tint: 'bg-blue-50 text-blue-600' },
  image: { label: 'Image', Icon: ImageIcon, tint: 'bg-emerald-50 text-emerald-600' },
};

const STATUS_LABEL: Record<Approval['status'], string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function ApprovalRow({ approval, highlighted }: { approval: Approval; highlighted?: boolean }) {
  const { label, Icon, tint } = TYPE_META[approval.type];

  return (
    <tr
      className={`border-b border-slate-100 text-sm last:border-0 ${
        highlighted ? 'bg-violet-50/70 shadow-[inset_3px_0_0_0_#7c3aed]' : 'hover:bg-slate-50'
      }`}
    >
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tint}`}>
            <Icon aria-hidden className="h-4 w-4" />
          </span>
          <span className="font-medium text-slate-800">{approval.title}</span>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
          <Icon aria-hidden className="h-3 w-3" />
          {label}
        </span>
      </td>
      <td className="px-3 py-3 text-slate-600">{approval.submittedBy}</td>
      <td className="px-3 py-3 text-slate-600">{approval.submittedDateLabel}</td>
      <td className="px-3 py-3">
        <span className="inline-flex rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">
          {STATUS_LABEL[approval.status]}
        </span>
      </td>
      <td className="px-3 py-3 text-right text-slate-400">
        {/* Approve/reject is out of scope for this assignment; the menu is visual only. */}
        <MoreVertical aria-hidden className="ml-auto h-4 w-4" />
      </td>
    </tr>
  );
}
