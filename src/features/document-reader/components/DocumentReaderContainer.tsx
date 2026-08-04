'use client';

import { useState, useEffect, type ReactNode, type ComponentType } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Project } from '@/entities/project';
import { ProjectDescriptionButton } from '@/entities/project';
import { PdfReader } from './PdfReader';
import {
  MarkdownReader,
  type ChapterBookmarkButtonShape,
  type CommentsSectionShape,
} from './MarkdownEngine/MarkdownReader';
import { VideoPlayer } from './VideoPlayer';
import { GalleryViewer } from './GalleryViewer';
import { DownloadLinksSection } from './DownloadLinksSection';
import { StarsBackground } from '@/shared/ui/StarsBackground';
import { Breadcrumb } from '@/shared/ui/Breadcrumb';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  FileText,
  Video,
  Music,
  Image as ImageIcon
} from 'lucide-react';

export type ReadingStatus = 'reading' | 'completed';
export type ProgressUpdater = (
  chapterNumber: number,
  totalChapters: number,
  status: ReadingStatus
) => void | Promise<void>;

export interface DocumentReaderContainerProps {
  project: Project;
  /** Botón de favorito ya resuelto por la página (composición vía app, no import cruzado de features) */
  favoriteButton?: ReactNode;
  /** Server Action ligada al proyecto actual, para registrar progreso de lectura */
  onProgressUpdate?: ProgressUpdater;
  /** Referencia al componente de "guardar capítulo", resuelto por la página */
  ChapterBookmarkButton?: ComponentType<ChapterBookmarkButtonShape>;
  /** Capítulos que el usuario ya guardó para esta obra */
  bookmarkedChapters?: number[];
  /** Referencia a la sección de comentarios, resuelta por la página (ver app/categorias/[id]/page.tsx) */
  CommentsSection?: ComponentType<CommentsSectionShape>;
  /** Id del usuario con sesión activa, para habilitar escritura de comentarios */
  currentUserId?: string | null;
}

export function DocumentReaderContainer({
  project,
  favoriteButton,
  onProgressUpdate,
  ChapterBookmarkButton,
  bookmarkedChapters,
  CommentsSection,
  currentUserId,
}: DocumentReaderContainerProps) {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode');
  const chapterParam = searchParams.get('chapter');
  const initialChapterNumber = chapterParam ? parseInt(chapterParam, 10) : undefined;

  // Marca la obra como "en lectura" apenas se abre, sin importar el formato.
  // MarkdownReader luego afina esto con el capítulo y el total reales.
  useEffect(() => {
    onProgressUpdate?.(1, 1, 'reading');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  // Requiere file_type === 'markdown' explícito (no basta con markdown_content truthy):
  // updateProjectAction guarda un "stub" de frontmatter en markdown_content como respaldo
  // de video/audio/gallery_urls incluso en obras sin manuscrito real (Apps, Games, etc.),
  // así que markdown_content por sí solo ya no es señal confiable de que hay un manuscrito.
  const hasMarkdown = Boolean(project.file_type === 'markdown' && (project.markdown_content || project.document_url));
  const hasPdf = Boolean(project.document_url || project.file_type === 'pdf');
  const hasVideo = Boolean(project.video_url && project.video_url.trim());
  const hasAudio = Boolean(project.audio_url && project.audio_url.trim());
  const hasGallery = Boolean(project.gallery_urls && project.gallery_urls.length > 0);

  // Determine active view mode
  const getDefaultMode = () => {
    if (initialMode && ['markdown', 'pdf', 'video', 'audio', 'gallery'].includes(initialMode)) {
      return initialMode;
    }
    if (hasVideo) return 'video';
    if (hasMarkdown) return 'markdown';
    if (hasPdf) return 'pdf';
    if (hasGallery) return 'gallery';
    return 'details';
  };

  const [activeMode, setActiveMode] = useState<string>(getDefaultMode());

  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode]);

  const activeTabCount = [hasMarkdown, hasPdf, hasVideo, hasAudio, hasGallery].filter(Boolean).length;

  // Format Switcher Bar
  const renderFormatTabs = () => {
    if (activeTabCount <= 1) return null;

    return (
      <div className="bg-[#120A08] border-b border-white/15 px-6 py-2 flex items-center justify-center gap-2 font-mono text-xs overflow-x-auto">
        {hasMarkdown && (
          <button
            type="button"
            onClick={() => setActiveMode('markdown')}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'markdown'
                ? 'bg-[#8B2FE0] text-white border-[#C084FC]'
                : 'bg-black/60 text-[#C084FC] border-white/10 hover:border-[#8B2FE0]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> MANUSCRITO
          </button>
        )}

        {hasPdf && (
          <button
            type="button"
            onClick={() => setActiveMode('pdf')}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'pdf'
                ? 'bg-[#7ED957] text-[#0D0A08] border-[#7ED957]'
                : 'bg-black/60 text-[#7ED957] border-white/10 hover:border-[#7ED957]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        )}

        {hasVideo && (
          <button
            type="button"
            onClick={() => setActiveMode('video')}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'video'
                ? 'bg-[#FFD700] text-[#0D0A08] border-[#FFD700]'
                : 'bg-black/60 text-[#FFD700] border-white/10 hover:border-[#FFD700]'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> VIDEO
          </button>
        )}

        {hasGallery && (
          <button
            type="button"
            onClick={() => setActiveMode('gallery')}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'gallery'
                ? 'bg-[#FF69B4] text-[#0D0A08] border-[#FF69B4]'
                : 'bg-black/60 text-[#FF69B4] border-white/10 hover:border-[#FF69B4]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> GALERÍA
          </button>
        )}
      </div>
    );
  };

  // Comentarios generales de la obra (no atados a un capítulo), reutilizados
  // en los 4 modos que no tienen noción de capítulo. Envuelto acá en el mismo
  // max-w/padding que usa MarkdownReader internamente, porque CommentsSection
  // no trae el suyo propio (ver nota en features/comments/components/CommentsSection.tsx).
  const generalComments = CommentsSection && (
    <div className="max-w-4xl mx-auto px-6 sm:px-12">
      <CommentsSection projectId={project.id} chapterNumber={null} currentUserId={currentUserId} />
    </div>
  );

  // Botón flotante para ver la sinopsis completa (sin truncar) — el lector
  // público antes no tenía forma de verla fuera del modo "ficha técnica".
  const descriptionButton = (
    <ProjectDescriptionButton
      title={project.title}
      description={project.description}
      imageUrl={project.image_url}
      category={project.category}
      status={project.status}
    />
  );

  // Zona de descarga (enlaces externos, ej. Google Drive) adjuntados por el admin.
  const downloadLinksSection = project.download_links && project.download_links.length > 0 && (
    <div className="max-w-4xl mx-auto px-6 sm:px-12 mb-10">
      <DownloadLinksSection links={project.download_links} />
    </div>
  );

  // 1. VIDEO VIEW MODE
  if (activeMode === 'video' && project.video_url) {
    return (
      <div className="min-h-screen bg-[#0D0A08]">
        {renderFormatTabs()}
        <VideoPlayer videoUrl={project.video_url} title={project.title} favoriteButton={favoriteButton} />
        {downloadLinksSection}
        {generalComments}
        {descriptionButton}
      </div>
    );
  }

  // 2. GALLERY VIEW MODE
  if (activeMode === 'gallery' && project.gallery_urls && project.gallery_urls.length > 0) {
    return (
      <div className="min-h-screen bg-[#0D0A08]">
        {renderFormatTabs()}
        <GalleryViewer images={project.gallery_urls} title={project.title} favoriteButton={favoriteButton} />
        {downloadLinksSection}
        {generalComments}
        {descriptionButton}
      </div>
    );
  }

  // 3. PDF VIEW MODE
  if (activeMode === 'pdf' && project.document_url) {
    return (
      <div className="min-h-screen bg-[#0D0A08]">
        {renderFormatTabs()}
        <PdfReader documentUrl={project.document_url} title={project.title} favoriteButton={favoriteButton} />
        {downloadLinksSection}
        {generalComments}
        {descriptionButton}
      </div>
    );
  }

  // 4. MARKDOWN VIEW MODE
  if (activeMode === 'markdown' && (project.markdown_content || project.document_url)) {
    const rawContent =
      project.markdown_content ||
      `# ${project.title}\n\n${project.description}\n\n*Documento disponible en: ${project.document_url}*`;

    return (
      <div className="min-h-screen bg-[#0D0A08] text-[#F2EDE4]">
        {renderFormatTabs()}
        {/* Navigation Bar */}
        <nav className="bg-[#120A08] border-b border-white/15 px-6 py-4 flex items-center justify-between sticky top-0 z-40 font-mono text-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/categorias"
              className="p-2 bg-black/60 hover:bg-[#8B2FE0] text-white rounded-xl border border-white/20 transition-all font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> CATÁLOGO
            </Link>
            {favoriteButton}
          </div>
          <span className="text-[#C084FC] font-bold uppercase tracking-wider hidden sm:inline">
            SISTEMA ESTRATO &bull; LECTOR DE OBRAS
          </span>
        </nav>

        <MarkdownReader
          content={rawContent}
          title={project.title}
          projectId={project.id}
          initialChapterNumber={initialChapterNumber}
          BookmarkButton={ChapterBookmarkButton}
          bookmarkedChapters={bookmarkedChapters}
          onProgressUpdate={onProgressUpdate}
          CommentsSection={CommentsSection}
          currentUserId={currentUserId}
        />
        {downloadLinksSection}
        {descriptionButton}
      </div>
    );
  }

  // 5. FALLBACK / FICHA TÉCNICA
  return (
    <StarsBackground className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] font-mono py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Breadcrumb
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Categorías', href: '/categorias' },
              { label: project.title },
            ]}
          />
          {favoriteButton}
        </div>

        {renderFormatTabs()}

        <div className="bg-[#120A08] border border-white/15 rounded-3xl overflow-hidden shadow-2xl mt-4">
          <div className="relative h-80 w-full bg-black/60">
            <Image
              src={project.image_url || '/images/WIP.png'}
              alt={project.title}
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#8B2FE0] text-white border border-[#C084FC]/50 backdrop-blur-md">
                {project.category}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-black/80 text-white border border-white/20 backdrop-blur-md">
                {project.status}
              </span>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 text-[#7ED957] text-xs font-bold uppercase tracking-widest mb-3">
              <Layers className="w-4 h-4" /> FICHA TÉCNICA &amp; MULTIMEDIA
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-6">
              {project.title}
            </h1>

            <p className="font-sans text-base leading-relaxed text-[#F2EDE4]/90 mb-8 whitespace-pre-wrap">
              {project.description}
            </p>

            {project.audio_url && (
              <div className="p-4 bg-[#00BFFF]/10 border border-[#00BFFF]/40 rounded-2xl mb-6">
                <div className="flex items-center gap-2 text-[#00BFFF] text-xs font-bold uppercase mb-2">
                  <Music className="w-4 h-4" /> PISTA DE AUDIO &amp; SOUNDTRACK BGM
                </div>
                <audio src={project.audio_url} controls className="w-full" />
              </div>
            )}

            {project.download_links && project.download_links.length > 0 && (
              <div className="mb-6">
                <DownloadLinksSection links={project.download_links} />
              </div>
            )}

            <div className="p-5 bg-black/40 border border-white/15 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#F2EDE4]/70">
                <BookOpen className="w-4 h-4 text-[#C084FC]" />
                <span>Explora las pestañas superiores para conmutar entre los formatos de esta obra.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ya dentro del max-w-4xl mx-auto ambiente: no necesita el wrapper extra de generalComments */}
        {CommentsSection && (
          <CommentsSection projectId={project.id} chapterNumber={null} currentUserId={currentUserId} />
        )}
      </div>
    </StarsBackground>
  );
}
