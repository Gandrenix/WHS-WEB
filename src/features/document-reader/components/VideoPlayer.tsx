'use client';

import type { ReactNode } from 'react';
import { Video, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumb } from '@/shared/ui/Breadcrumb';

export interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  favoriteButton?: ReactNode;
}

export function getVideoEmbedInfo(url: string): { type: 'iframe' | 'direct'; embedUrl: string } {
  if (!url) return { type: 'iframe', embedUrl: '' };

  const trimmed = url.trim();

  // YouTube match: youtube.com/watch?v=ID or youtu.be/ID
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch) {
    return {
      type: 'iframe',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }

  // TikTok match: tiktok.com/@user/video/ID
  const tiktokMatch = trimmed.match(/tiktok\.com\/.*\/video\/(\d+)/);
  if (tiktokMatch) {
    return {
      type: 'iframe',
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
    };
  }

  // Google Drive match: drive.google.com/file/d/ID
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (driveMatch) {
    return {
      type: 'iframe',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  // Direct MP4 / WebM
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return { type: 'direct', embedUrl: trimmed };
  }

  return { type: 'iframe', embedUrl: trimmed };
}

export function VideoPlayer({ videoUrl, title, favoriteButton }: VideoPlayerProps) {
  const { type, embedUrl } = getVideoEmbedInfo(videoUrl);

  return (
    <div className="w-full min-h-screen bg-[#0D0A08] text-[#F2EDE4] flex flex-col font-mono">
      {/* Video Toolbar Header */}
      <header className="bg-[#120A08] border-b border-white/15 px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-3">
          <Link
            href="/categorias"
            className="p-2 bg-black/60 hover:bg-[#8B2FE0] text-white rounded-lg border border-white/20 transition-all text-xs flex items-center gap-1 font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> VOLVER
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <Video className="w-5 h-5 text-[#FFD700] shrink-0" />
            <Breadcrumb
              items={[
                { label: 'Inicio', href: '/' },
                { label: 'Categorías', href: '/categorias' },
                { label: title },
              ]}
            />
          </div>
          {favoriteButton}
        </div>

        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" /> ABRIR EN ORIGEN
        </a>
      </header>

      {/* Main Video Screen Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="w-full bg-[#160E0A] border border-[#FFD700]/40 rounded-3xl overflow-hidden shadow-2xl relative aspect-video">
          {type === 'direct' ? (
            <video
              src={embedUrl}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            >
              Su navegador no soporta la reproducción de video HTML5.
            </video>
          ) : (
            <iframe
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-none bg-black"
              title={title}
            />
          )}
        </div>
      </main>
    </div>
  );
}
