'use client';
// Client: isla pequeña para el logo interactivo con reproducción de audio easter egg

import Link from 'next/link';
import Image from 'next/image';
import { useLogoAudio } from '../hooks/useLogoAudio';

export function LogoAudioPlayer({ isDark = false }: { isDark?: boolean }) {
  const { isPlaying, toggleMusic } = useLogoAudio();

  return (
    <div className="flex items-center gap-3">
      <Link href="/" className="logo flex items-center group">
        <div className="relative w-[50px] h-[50px]">
          <Image
            src={isPlaying ? '/images/logo-playing.png' : '/images/logo.png'}
            alt="Wiener Hound Studios Logo"
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <span
          className={`logo-text ml-3 text-xl md:text-2xl font-mono font-black tracking-tight whitespace-nowrap transition-colors ${
            isDark ? 'text-white' : 'text-[#0D0A08]'
          }`}
        >
          WH<span className="text-[#8B2FE0]">-</span>STUDIOS
        </span>
      </Link>

      <button
        onClick={toggleMusic}
        type="button"
        title={isPlaying ? 'Pausar audio de ambiente' : 'Reproducir audio de ambiente'}
        aria-label={isPlaying ? 'Pausar audio de ambiente' : 'Reproducir audio de ambiente'}
        className="px-2.5 py-1 rounded-full bg-[#8B2FE0]/10 hover:bg-[#8B2FE0]/20 text-[#8B2FE0] text-xs font-mono font-bold transition-all cursor-pointer border border-[#8B2FE0]/30"
      >
        {isPlaying ? '🔊 AUD' : '🎵 AUD'}
      </button>
    </div>
  );
}
