import type { Project } from '../types';
import { BookOpen, FileText, Video, Music, Image as ImageIcon } from 'lucide-react';

export interface MediaBadgesProps {
  project: Project;
  className?: string;
}

export function MediaBadges({ project, className = '' }: MediaBadgesProps) {
  const hasMarkdown = Boolean(project.markdown_content || (project.file_type === 'markdown' && !project.document_url));
  const hasPdf = Boolean(project.document_url || project.file_type === 'pdf');
  const hasVideo = Boolean(project.video_url && project.video_url.trim());
  const hasAudio = Boolean(project.audio_url && project.audio_url.trim());
  const hasGallery = Boolean(project.gallery_urls && project.gallery_urls.length > 0);

  if (!hasMarkdown && !hasPdf && !hasVideo && !hasAudio && !hasGallery) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 items-center font-mono text-[10px] font-bold uppercase tracking-wider ${className}`}>
      {hasMarkdown && (
        <span className="px-2 py-0.5 rounded-md bg-[#8B2FE0]/25 text-[#C084FC] border border-[#8B2FE0]/50 backdrop-blur-md flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-[#C084FC]" /> MD
        </span>
      )}
      {hasPdf && (
        <span className="px-2 py-0.5 rounded-md bg-[#7ED957]/20 text-[#7ED957] border border-[#7ED957]/40 backdrop-blur-md flex items-center gap-1">
          <FileText className="w-3 h-3 text-[#7ED957]" /> PDF
        </span>
      )}
      {hasVideo && (
        <span className="px-2 py-0.5 rounded-md bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 backdrop-blur-md flex items-center gap-1">
          <Video className="w-3 h-3 text-[#FFD700]" /> VIDEO
        </span>
      )}
      {hasAudio && (
        <span className="px-2 py-0.5 rounded-md bg-[#00BFFF]/20 text-[#00BFFF] border border-[#00BFFF]/40 backdrop-blur-md flex items-center gap-1">
          <Music className="w-3 h-3 text-[#00BFFF]" /> AUDIO
        </span>
      )}
      {hasGallery && (
        <span className="px-2 py-0.5 rounded-md bg-[#FF69B4]/20 text-[#FF69B4] border border-[#FF69B4]/40 backdrop-blur-md flex items-center gap-1">
          <ImageIcon className="w-3 h-3 text-[#FF69B4]" /> GALERÍA
        </span>
      )}
    </div>
  );
}
