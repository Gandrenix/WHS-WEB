'use client';

// Client component for interactive reading, audio triggers and dynamic fonts
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, BookOpen } from 'lucide-react';
import { parseMarkdownStory, parseInlineStyles } from './MarkdownParser';
import { StoryCallout } from './StoryCallout';
import { StoryDialogue } from './StoryDialogue';
import Image from 'next/image';

export interface MarkdownReaderProps {
  content: string;
  title?: string;
}

export function MarkdownReader({ content, title }: MarkdownReaderProps) {
  const { frontmatter, blocks } = parseMarkdownStory(content);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const bgmUrl = frontmatter.bgm;
  const defaultFontClass =
    frontmatter.default_font === 'mono'
      ? 'font-mono'
      : frontmatter.default_font === 'sans'
      ? 'font-sans'
      : 'font-serif';

  useEffect(() => {
    if (bgmUrl) {
      audioRef.current = new Audio(bgmUrl);
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

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  return (
    <article
      className={`relative min-h-screen py-16 px-6 sm:px-12 max-w-4xl mx-auto text-[#F2EDE4] ${defaultFontClass}`}
      style={{ backgroundColor: frontmatter.ambient_light || 'transparent' }}
    >
      {/* Background Audio Control Bar if BGM present */}
      {bgmUrl && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
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
      {(frontmatter.title || title) && (
        <header className="text-center mb-16 pb-10 border-b border-white/15">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B2FE0]/25 text-[#C084FC] font-mono text-[11px] font-bold uppercase tracking-widest mb-4 border border-[#8B2FE0]/40">
            <BookOpen className="w-3.5 h-3.5" /> LECTURA INMERSIVA ESTRATO
          </div>
          <h1 className="font-mono text-3xl sm:text-5xl font-black uppercase text-white tracking-tight mb-4 drop-shadow-lg">
            {frontmatter.title || title}
          </h1>
          {frontmatter.author && (
            <p className="font-mono text-xs text-[#F2EDE4]/70 font-bold uppercase tracking-wider">
              POR {frontmatter.author} {frontmatter.reading_time_minutes ? `&bull; ${frontmatter.reading_time_minutes} MIN DE LECTURA` : ''}
            </p>
          )}
        </header>
      )}

      {/* Story Content Blocks */}
      <div className="space-y-6 text-base sm:text-lg leading-relaxed">
        {blocks.map((block, index) => {
          if (block.type === 'scene_divider') {
            return (
              <div key={index} className="my-12 flex items-center justify-center gap-3">
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
                ? 'text-3xl sm:text-4xl font-black font-mono uppercase text-white mt-12 mb-6 border-b border-white/15 pb-3'
                : hLevel === 2
                ? 'text-2xl sm:text-3xl font-bold font-mono uppercase text-[#C084FC] mt-10 mb-4'
                : 'text-xl font-bold font-mono text-[#7ED957] mt-8 mb-3';

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

          if (block.type === 'embed_image') {
            return (
              <div key={index} className="my-8 rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl relative">
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
    </article>
  );
}
