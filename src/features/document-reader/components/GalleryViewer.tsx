'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Image as ImageIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Breadcrumb } from '@/shared/ui/Breadcrumb';
import { GalleryFocusRail } from './GalleryFocusRail';

export interface GalleryViewerProps {
  images: string[];
  title: string;
  favoriteButton?: ReactNode;
}

export function GalleryViewer({ images, title, favoriteButton }: GalleryViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const currentImage = images[activeIndex] || images[0] || '/images/WIP.png';

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="w-full min-h-screen bg-[#0D0A08] text-[#F2EDE4] flex flex-col font-mono">
      {/* Gallery Header Toolbar */}
      <header className="bg-[#120A08] border-b border-white/15 px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-3">
          <Link
            href="/categorias"
            className="p-2 bg-black/60 hover:bg-[#8B2FE0] text-white rounded-lg border border-white/20 transition-all text-xs flex items-center gap-1 font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> VOLVER
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="w-5 h-5 text-[#FF69B4] shrink-0" />
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

        <div className="text-xs font-bold text-[#FF69B4] bg-[#FF69B4]/10 px-3 py-1.5 rounded-xl border border-[#FF69B4]/30">
          ILUSTRACIÓN {activeIndex + 1} DE {images.length}
        </div>
      </header>

      {/* Main Showcase Stage */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 flex flex-col items-center justify-center gap-6">
        <div className="relative w-full h-[550px] sm:h-[650px] bg-black/80 border border-[#FF69B4]/30 rounded-3xl overflow-hidden shadow-2xl group flex items-center justify-center">
          <Image
            src={currentImage}
            alt={`${title} - Imagen ${activeIndex + 1}`}
            fill
            className="object-contain"
            unoptimized
          />

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-[#8B2FE0] text-white rounded-full border border-white/20 transition-all cursor-pointer shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-[#8B2FE0] text-white rounded-full border border-white/20 transition-all cursor-pointer shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Lightbox Trigger */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-4 right-4 p-2.5 bg-black/80 hover:bg-[#FF69B4] text-white rounded-xl border border-white/20 transition-all cursor-pointer shadow-xl text-xs font-bold flex items-center gap-1.5 opacity-80 group-hover:opacity-100"
          >
            <Maximize2 className="w-4 h-4" /> PANTALLA COMPLETA
          </button>
        </div>

        {/* Riel de miniaturas con perspectiva 3D */}
        {images.length > 1 && (
          <div className="w-full max-w-2xl bg-black/60 rounded-2xl border border-white/15 px-4">
            <GalleryFocusRail
              images={images}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              title={title}
            />
          </div>
        )}
      </main>

      {/* Lightbox Overlay */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
            <Image src={currentImage} alt="Fullscreen View" fill className="object-contain" unoptimized />
          </div>
        </div>
      )}
    </div>
  );
}
