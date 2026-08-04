'use client';

// Client component for interactive reading, audio triggers, chapters and dynamic fonts
import { useEffect, useRef, useState, type ComponentType } from 'react';
import {
  Volume2,
  VolumeX,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  ChevronDown,
  X,
  Layers
} from 'lucide-react';
import { parseStoryChapters, parseInlineStyles } from './MarkdownParser';
import { StoryCallout } from './StoryCallout';
import { StoryDialogue } from './StoryDialogue';
import { DropCapTilt } from './DropCapTilt';
import { Breadcrumb } from '@/shared/ui/Breadcrumb';
import Image from 'next/image';

export type ReadingStatus = 'reading' | 'completed';

// Forma estructural mínima del botón de "guardar capítulo" — se declara aquí (no se
// importa desde `reader-dashboard`) para no violar boundaries feature->feature.
// El componente real que llega por props cumple esta forma por estructura, no por herencia.
export interface ChapterBookmarkButtonShape {
  projectId: string;
  chapterNumber: number;
  chapterTitle?: string | null;
  initialBookmarked: boolean;
}

// Misma lógica de composición que ChapterBookmarkButtonShape: se declara acá
// (no se importa desde `comments`) para no violar boundaries feature->feature.
export interface CommentsSectionShape {
  projectId: string;
  chapterNumber: number | null;
  chapterTitle?: string | null;
  currentUserId?: string | null;
}

export interface MarkdownReaderProps {
  content: string;
  title?: string;
  /** Id del proyecto, solo necesario si se quiere habilitar "guardar capítulo" */
  projectId?: string;
  /** Capítulo inicial (1-based) para abrir directo desde un enlace guardado, ej. ?chapter=3 */
  initialChapterNumber?: number;
  /** Referencia al componente de bookmark (resuelto por la página, ver DocumentReaderContainer) */
  BookmarkButton?: ComponentType<ChapterBookmarkButtonShape>;
  /** Números de capítulo que el usuario ya guardó para esta obra */
  bookmarkedChapters?: number[];
  /** Registra el capítulo alcanzado (server action ligada al proyecto, ver DocumentReaderContainer) */
  onProgressUpdate?: (chapterNumber: number, totalChapters: number, status: ReadingStatus) => void | Promise<void>;
  /** Referencia a la sección de comentarios (resuelta por la página, ver DocumentReaderContainer) */
  CommentsSection?: ComponentType<CommentsSectionShape>;
  /** Id del usuario con sesión activa, para habilitar escritura de comentarios */
  currentUserId?: string | null;
}

export function MarkdownReader({
  content,
  title,
  projectId,
  initialChapterNumber,
  BookmarkButton,
  bookmarkedChapters = [],
  onProgressUpdate,
  CommentsSection,
  currentUserId,
}: MarkdownReaderProps) {
  const { frontmatter, chapters } = parseStoryChapters(content);
  const [activeChapterIndex, setActiveChapterIndex] = useState(() => {
    if (!initialChapterNumber) return 0;
    const index = initialChapterNumber - 1;
    return index >= 0 && index < chapters.length ? index : 0;
  });
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);

  const currentChapter = chapters[activeChapterIndex] || chapters[0];
  const prevChapter = activeChapterIndex > 0 ? chapters[activeChapterIndex - 1] : null;
  const nextChapter = activeChapterIndex < chapters.length - 1 ? chapters[activeChapterIndex + 1] : null;

  const blocks = currentChapter ? currentChapter.blocks : [];
  const firstParagraphIndex = blocks.findIndex((b) => b.type === 'paragraph');

  const bgmUrl = frontmatter.bgm;
  const defaultFontClass =
    frontmatter.default_font === 'mono'
      ? 'font-mono'
      : frontmatter.default_font === 'sans'
      ? 'font-sans'
      : 'font-serif';

  useEffect(() => {
    if (bgmUrl) {
      audioRef.current = new Audio(bgmUrl as string);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [bgmUrl]);

  // Reporta el capítulo alcanzado cada vez que cambia; el último capítulo se marca como completado.
  useEffect(() => {
    if (!onProgressUpdate || chapters.length === 0) return;
    const isLastChapter = activeChapterIndex === chapters.length - 1;
    onProgressUpdate(activeChapterIndex + 1, chapters.length, isLastChapter ? 'completed' : 'reading');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapterIndex, chapters.length]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  const scrollToTop = () => {
    if (articleRef.current) {
      articleRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const changeChapter = (index: number) => {
    if (index >= 0 && index < chapters.length) {
      setActiveChapterIndex(index);
      setShowChapterDrawer(false);
      scrollToTop();
    }
  };

  const obraTitle = (frontmatter.title as string) || title || 'Obra';
  const isChaptered = chapters.length > 1;
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Categorías', href: '/categorias' },
    isChaptered && projectId
      ? { label: obraTitle, href: `/categorias/${projectId}` }
      : { label: obraTitle },
    ...(isChaptered ? [{ label: currentChapter?.title || `Capítulo ${activeChapterIndex + 1}` }] : []),
  ];

  return (
    <article
      ref={articleRef}
      className={`relative min-h-screen py-12 px-6 sm:px-12 max-w-4xl mx-auto text-[#F2EDE4] ${defaultFontClass}`}
      style={{ backgroundColor: (frontmatter.ambient_light as string) || 'transparent' }}
    >
      {/* Background Audio Control Bar if BGM present */}
      {bgmUrl && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={toggleAudio}
            className="p-3.5 bg-[#8B2FE0] hover:bg-[#C084FC] text-white rounded-full shadow-2xl transition-all flex items-center gap-2 border border-white/20 font-mono text-xs cursor-pointer"
          >
            {isPlayingAudio ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
            <span className="font-bold uppercase tracking-wider hidden sm:inline">
              {isPlayingAudio ? 'AUDIO ACTIVO' : 'MÚSICA DE FONDO'}
            </span>
          </button>
        </div>
      )}

      {/* Chapter Title / Frontmatter Header */}
      <header className="text-center mb-12 pb-8 border-b border-white/15">
        <div className="flex justify-center mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B2FE0]/25 text-[#C084FC] font-mono text-[11px] font-bold uppercase tracking-widest mb-4 border border-[#8B2FE0]/40">
          <BookOpen className="w-3.5 h-3.5" /> LECTURA INMERSIVA ESTRATO
        </div>
        
        {/* Act or Season Badge if Present */}
        {currentChapter?.actOrSeason && (
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFD700] mb-2 flex items-center justify-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{currentChapter.actOrSeason}</span>
          </div>
        )}

        <h1 className="font-mono text-3xl sm:text-5xl font-black uppercase text-white tracking-tight mb-4 drop-shadow-lg">
          {frontmatter.title || title || currentChapter.title}
        </h1>

        {frontmatter.author && (
          <p className="font-mono text-xs text-[#F2EDE4]/70 font-bold uppercase tracking-wider mb-6">
            POR {String(frontmatter.author)} {frontmatter.reading_time_minutes ? `&bull; ${frontmatter.reading_time_minutes} MIN DE LECTURA` : ''}
          </p>
        )}

        {/* Chapter Selection Bar */}
        {chapters.length > 1 && (
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 bg-black/60 p-2 rounded-2xl border border-white/15 shadow-xl">
            <div className="flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold text-[#C084FC]">
              <span>SECCIÓN {activeChapterIndex + 1} DE {chapters.length}:</span>
            </div>
            <button
              type="button"
              onClick={() => setShowChapterDrawer(!showChapterDrawer)}
              className="px-4 py-2 bg-[#8B2FE0]/30 hover:bg-[#8B2FE0]/50 border border-[#8B2FE0] text-white rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="truncate max-w-[200px] sm:max-w-[300px]">{currentChapter.title}</span>
              <ChevronDown className="w-4 h-4 text-[#C084FC]" />
            </button>
          </div>
        )}

        {BookmarkButton && projectId && (
          <div className="mt-4 flex justify-center">
            <BookmarkButton
              projectId={projectId}
              chapterNumber={activeChapterIndex + 1}
              chapterTitle={currentChapter?.title}
              initialBookmarked={bookmarkedChapters.includes(activeChapterIndex + 1)}
            />
          </div>
        )}
      </header>

      {/* Chapter Drawer / Modal Index */}
      {showChapterDrawer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#120A08] border border-[#8B2FE0] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <span className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <List className="w-4 h-4 text-[#C084FC]" /> ÍNDICE DE LA OBRA ({chapters.length} SECCIONES)
              </span>
              <button
                type="button"
                onClick={() => setShowChapterDrawer(false)}
                className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {chapters.map((chap, idx) => {
                const showActHeader = idx === 0 || chap.actOrSeason !== chapters[idx - 1].actOrSeason;

                return (
                  <div key={chap.id} className="space-y-1">
                    {showActHeader && chap.actOrSeason && (
                      <div className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider pt-2 pb-1 flex items-center gap-1.5 border-b border-[#FFD700]/20">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{chap.actOrSeason}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => changeChapter(idx)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        idx === activeChapterIndex
                          ? 'bg-[#8B2FE0] text-white border-[#C084FC] shadow-lg'
                          : 'bg-black/50 text-[#F2EDE4]/80 border-white/10 hover:border-[#8B2FE0]/50 hover:bg-white/5'
                      }`}
                    >
                      <span className="font-bold text-xs truncate mr-2">
                        {chap.title}
                      </span>
                      {idx === activeChapterIndex && (
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase font-bold shrink-0">
                          LEYENDO
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Story Content Blocks for Current Chapter */}
      <div className="space-y-6 text-base sm:text-lg leading-relaxed">
        {blocks.map((block, index) => {
          if (block.type === 'scene_divider') {
            return (
              <div key={index} className="my-12 flex items-center justify-center gap-3 clear-both">
                <span className="h-[1px] w-24 bg-gradient-to-r from-transparent to-[#8B2FE0]" />
                <span className="text-[#C084FC] text-xs font-mono font-bold tracking-widest">&bull; &bull; &bull;</span>
                <span className="h-[1px] w-24 bg-gradient-to-l from-transparent to-[#8B2FE0]" />
              </div>
            );
          }

          if (block.type === 'heading') {
            const hLevel = block.level || 2;
            const hStyles =
              hLevel === 1
                ? 'text-3xl sm:text-4xl font-black font-mono uppercase text-white mt-12 mb-6 border-b border-white/15 pb-3 clear-both'
                : hLevel === 2
                ? 'text-2xl sm:text-3xl font-bold font-mono uppercase text-[#C084FC] mt-10 mb-4 clear-both'
                : 'text-xl font-bold font-mono text-[#7ED957] mt-8 mb-3 clear-both';

            return (
              <h2 key={index} className={hStyles}>
                {block.content}
              </h2>
            );
          }

          if (block.type === 'callout') {
            return (
              <StoryCallout
                key={index}
                type={block.calloutType || 'note'}
                title={block.calloutTitle || 'NOTA'}
                content={block.content}
              />
            );
          }

          if (block.type === 'speech') {
            return (
              <StoryDialogue
                key={index}
                speaker={block.speaker || 'Personaje'}
                content={block.content}
                avatar={block.avatar}
                side={block.side}
                color={block.color}
                id={block.id}
              />
            );
          }

          if (block.type === 'cyoa_choice') {
            return (
              <div key={index} className="my-4 clear-both">
                <a
                  href={`#${block.id || ''}`}
                  className="w-full group p-4 rounded-xl border border-[#8B2FE0]/60 bg-[#120A08]/90 hover:bg-[#8B2FE0]/20 hover:border-[#C084FC] transition-all flex items-center justify-between shadow-xl cursor-pointer"
                >
                  <span className="font-mono text-xs sm:text-sm font-bold text-white group-hover:text-[#C084FC] transition-colors flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8B2FE0] group-hover:animate-ping" />
                    {block.content}
                  </span>
                  <span className="font-mono text-xs font-black text-[#C084FC] group-hover:translate-x-1 transition-transform">
                    TOMAR DECISIÓN &rarr;
                  </span>
                </a>
              </div>
            );
          }

          if (block.type === 'embed_image') {
            return (
              <div key={index} className="my-8 rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl relative clear-both">
                <Image
                  src={block.src || '/images/pale-veil.png'}
                  alt={block.alt || 'Ilustración de escena'}
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            );
          }

          if (block.type === 'paragraph') {
            const isFirstParagraph = index === firstParagraphIndex;

            if (isFirstParagraph && block.content.trim().length > 0) {
              const rawText = block.content.trim();
              const firstLetter = rawText.charAt(0);
              const restText = rawText.slice(1);
              const htmlRest = parseInlineStyles(restText);

              return (
                <p
                  key={index}
                  id={block.id}
                  className="text-[#F2EDE4]/90 leading-relaxed tracking-normal font-sans flow-root clear-both"
                >
                  <DropCapTilt letter={firstLetter} color="#C084FC" />
                  <span dangerouslySetInnerHTML={{ __html: htmlRest }} />
                </p>
              );
            }

            const html = parseInlineStyles(block.content);
            return (
              <p
                key={index}
                id={block.id}
                className="text-[#F2EDE4]/90 leading-relaxed tracking-normal font-sans"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }

          return null;
        })}
      </div>

      {/* Dynamic End of Chapter Navigation Footer */}
      <footer className="mt-16 pt-8 border-t border-white/15 flex flex-col gap-6">
        <div className="flex items-center justify-between font-mono text-xs font-bold text-[#F2EDE4]/60 uppercase tracking-wider">
          <span>
            SECCIÓN {activeChapterIndex + 1} DE {chapters.length} &bull; {currentChapter.title}
          </span>
          <span className="text-[#C084FC]">
            {activeChapterIndex === chapters.length - 1 ? 'FIN DE LA OBRA' : 'CONTINUARÁ...'}
          </span>
        </div>

        {/* Chapter Control Buttons with Real Dynamic Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {/* Previous Section */}
          <button
            type="button"
            onClick={() => changeChapter(activeChapterIndex - 1)}
            disabled={activeChapterIndex === 0}
            className="p-3.5 rounded-xl border border-white/20 bg-black/60 hover:bg-[#8B2FE0]/30 hover:border-[#8B2FE0] text-white disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer font-bold text-left"
          >
            <ChevronLeft className="w-4 h-4 text-[#C084FC] shrink-0" />
            <span className="truncate">
              {prevChapter ? `ANTERIOR: ${prevChapter.title}` : 'ANTERIOR'}
            </span>
          </button>

          {/* Index / Home */}
          <button
            type="button"
            onClick={() => setShowChapterDrawer(true)}
            className="p-3.5 rounded-xl border border-[#8B2FE0]/50 bg-[#8B2FE0]/20 hover:bg-[#8B2FE0]/40 text-[#C084FC] transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            <List className="w-4 h-4 shrink-0" />
            <span className="truncate">ÍNDICE DE LA OBRA ({chapters.length})</span>
          </button>

          {/* Next Section */}
          <button
            type="button"
            onClick={() => changeChapter(activeChapterIndex + 1)}
            disabled={activeChapterIndex === chapters.length - 1}
            className="p-3.5 rounded-xl border border-white/20 bg-black/60 hover:bg-[#8B2FE0]/30 hover:border-[#8B2FE0] text-white disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer font-bold text-right"
          >
            <span className="truncate">
              {nextChapter ? `SIGUIENTE: ${nextChapter.title}` : 'SIGUIENTE'}
            </span>
            <ChevronRight className="w-4 h-4 text-[#C084FC] shrink-0" />
          </button>
        </div>
      </footer>

      {CommentsSection && projectId && (
        <CommentsSection
          projectId={projectId}
          chapterNumber={activeChapterIndex + 1}
          chapterTitle={currentChapter?.title}
          currentUserId={currentUserId}
        />
      )}
    </article>
  );
}
