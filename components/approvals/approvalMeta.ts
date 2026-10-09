import { FileText, Folder, Image as ImageIcon, Video } from 'lucide-react';
import type { Approval } from '@/lib/contracts';

export const TYPE_META: Record<Approval['type'], { label: string; Icon: typeof Folder; tint: string }> = {
  folder: { label: 'Folder', Icon: Folder, tint: 'bg-[var(--tint-amber)] text-[var(--tint-amber-fg)]' },
  video: { label: 'Video', Icon: Video, tint: 'bg-[var(--tint-rose)] text-[var(--tint-rose-fg)]' },
  pdf: { label: 'PDF', Icon: FileText, tint: 'bg-[var(--tint-sky)] text-[var(--tint-sky-fg)]' },
  image: { label: 'Image', Icon: ImageIcon, tint: 'bg-[var(--tint-emerald)] text-[var(--tint-emerald-fg)]' },
};

export const STATUS_LABEL: Record<Approval['status'], string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};
