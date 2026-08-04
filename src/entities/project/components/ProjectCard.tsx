'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '../types';
import { MediaBadges } from './MediaBadges';
import { MediaFormatModal } from './MediaFormatModal';

export interface ProjectCardProps {
  project: Project;
  variant?: 'light' | 'dark' | 'bedrock';
}

export function ProjectCard({ project, variant = 'light' }: ProjectCardProps) {
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const isLight = variant === 'light';
  const isBedrock = variant === 'bedrock';

  const categoryColors: Record<string, string> = {
    apps: 'bg-[#7ED957]/20 text-[#2b6b15] border-[#7ED957]/60 font-bold',
    app: 'bg-[#7ED957]/20 text-[#2b6b15] border-[#7ED957]/60 font-bold',
    'apps-software': 'bg-[#7ED957]/20 text-[#2b6b15] border-[#7ED957]/60 font-bold',
    // "Animaciones" fusiona lo que antes eran Manga y Anime como categorías separadas
    animaciones: 'bg-[#8B2FE0]/15 text-[#8B2FE0] border-[#8B2FE0]/40',
    manga: 'bg-[#8B2FE0]/15 text-[#8B2FE0] border-[#8B2FE0]/40',
    anime: 'bg-[#8B2FE0]/15 text-[#8B2FE0] border-[#8B2FE0]/40',
    'visual-novel': 'bg-[#C084FC]/15 text-[#C084FC] border-[#C084FC]/40',
    games: 'bg-[#FFD700]/15 text-[#8a6d00] border-[#FFD700]/50',
  };

  const currentCategoryColor =
    categoryColors[project.category.toLowerCase()] ||
    'bg-[#8B2FE0]/15 text-[#8B2FE0] border-[#8B2FE0]/40';

  // Normaliza nombres viejos de categoría (manga/anime/apps-software) al
  // texto visible correcto, aunque en la base de datos quede el valor legado
  const categoryLabels: Record<string, string> = {
    apps: 'Apps',
    app: 'Apps',
    'apps-software': 'Apps',
    animaciones: 'Animaciones',
    manga: 'Animaciones',
    anime: 'Animaciones',
    'visual-novel': 'Visual Novels',
    games: 'Games',
  };
  const currentCategoryLabel = categoryLabels[project.category.toLowerCase()] || project.category;

  // Requiere file_type === 'markdown' explícito: markdown_content puede contener solo un
  // stub de frontmatter (respaldo de video/audio/gallery_urls) en obras sin manuscrito real.
  const hasMarkdown = Boolean(project.file_type === 'markdown' && (project.markdown_content || project.document_url));
  const hasPdf = Boolean(project.document_url || project.file_type === 'pdf');
  const hasVideo = Boolean(project.video_url && project.video_url.trim());
  const hasAudio = Boolean(project.audio_url && project.audio_url.trim());
  const hasGallery = Boolean(project.gallery_urls && project.gallery_urls.length > 0);

  const availableFormatCount = [hasMarkdown, hasPdf, hasVideo, hasAudio, hasGallery].filter(Boolean).length;

  const handleCardActionClick = (e: React.MouseEvent) => {
    if (availableFormatCount > 1) {
      e.preventDefault();
      setIsFormatModalOpen(true);
    }
  };

  return (
    <>
      <article
        className={`group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-md hover:shadow-xl border ${
          isBedrock
            ? 'bg-[#120A08] border-white/15 text-[#F2EDE4]'
            : !isLight
            ? 'bg-[#1A120E] border-white/10 text-[#F2EDE4]'
            : 'bg-white/90 border-[#3A3532]/15 text-[#0D0A08]'
        }`}
      >
        {/* Thumbnail */}
        <div className="relative h-56 w-full overflow-hidden bg-black/60">
          <Image
            src={project.image_url || '/images/WIP.png'}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md ${currentCategoryColor}`}
            >
              {currentCategoryLabel}
            </span>
          </div>
          {/* Status Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-black/70 text-white border border-white/20 backdrop-blur-md">
              {project.status}
            </span>
          </div>

          {/* Active Media Formats Badges Overlay */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <MediaBadges project={project} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow justify-between">
          <div>
            <h3
              className={`font-mono text-xl font-black mb-2 tracking-tight ${
                isLight ? 'text-[#0D0A08]' : 'text-white'
              }`}
            >
              {project.title}
            </h3>
            <p
              className={`font-sans text-xs leading-relaxed mb-6 line-clamp-3 ${
                isLight ? 'text-[#3A3532]' : 'text-[#F2EDE4]/80'
              }`}
            >
              {project.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-current/10 flex items-center justify-between">
            <Link
              href={`/categorias/${project.id}`}
              onClick={handleCardActionClick}
              className={`inline-flex items-center gap-2 font-mono text-xs font-bold transition-colors cursor-pointer ${
                isLight
                  ? 'text-[#8B2FE0] hover:text-[#0D0A08]'
                  : 'text-[#C084FC] hover:text-white'
              }`}
            >
              <span>{availableFormatCount > 1 ? 'ELEGIR FORMATO' : project.file_type ? 'LEER OBRA' : 'VER DETALLES'}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </article>

      {/* Format Selector Modal if multiple formats attached */}
      <MediaFormatModal
        project={project}
        isOpen={isFormatModalOpen}
        onClose={() => setIsFormatModalOpen(false)}
      />
    </>
  );
}
