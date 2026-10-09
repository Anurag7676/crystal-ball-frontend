import { FileText, Folder, Image as ImageIcon, Video } from 'lucide-react';
import type { Approval } from '@/lib/contracts';

export const TYPE_META: Record<Approval['type'], { label: string; Icon: typeof Folder }> = {
  folder: { label: 'Folder', Icon: Folder },
  video: { label: 'Video', Icon: Video },
  pdf: { label: 'PDF', Icon: FileText },
  image: { label: 'Image', Icon: ImageIcon },
};

export const STATUS_LABEL: Record<Approval['status'], string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};
