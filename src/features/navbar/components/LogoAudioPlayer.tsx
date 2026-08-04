'use client';
// Client: isla pequeña para el logo interactivo con reproducción de audio easter egg

import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/shared/assets/logo.png';
import logoPlayingImg from '@/shared/assets/logo-playing.png';
import { useLogoAudio } from '../hooks/useLogoAudio';

export function LogoAudioPlayer({ isDark = false }: { isDark?: boolean }) {
  const { isPlaying, toggleMusic } = useLogoAudio();

  return (
    <div className="flex items-center gap-3">
      <Link href="/" className="logo flex items-center group relative">
        {/* El contenedor mide siempre lo mismo (no afecta la altura del header).
            logo-playing.png se escala visualmente por encima de ese tamaño con
            transform -se sale del box sin empujar nada- para verse más grande. */}
        <div className="relative w-[80px] h-[80px]">
          <Image
            src={isPlaying ? logoPlayingImg : logoImg}
            alt="Wiener Hound Studios Logo"
            fill
            className={`object-contain transition-transform duration-300 group-hover:-rotate-3 ${
              isPlaying ? 'scale-[1.5] group-hover:scale-[1.55]' : 'group-hover:scale-105'
            }`}
          />
          {/* Anillo de señal: respira mientras suena la música de ambiente */}
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border border-[#8B2FE0]/50 animate-ping" />
          )}
        </div>
        <span
          className={`logo-text ml-3 text-xl md:text-2xl font-mono font-black tracking-tight whitespace-nowrap transition-colors ${
            isDark ? 'text-white' : 'text-[#0D0A08]'
          }`}
        >
          WH<span className="text-[#8B2FE0] group-hover:text-[#C084FC] transition-colors">-</span>STUDIOS
        </span>
      </Link>

      <button
        onClick={toggleMusic}
        type="button"
        title={isPlaying ? 'Pausar audio de ambiente' : 'Reproducir audio de ambiente'}
        aria-label={isPlaying ? 'Pausar audio de ambiente' : 'Reproducir audio de ambiente'}
        className={`hidden sm:flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer border ${
          isPlaying
            ? 'bg-[#8B2FE0] border-[#8B2FE0] text-white shadow-[0_0_14px_rgba(139,47,224,0.55)]'
            : 'bg-[#8B2FE0]/10 hover:bg-[#8B2FE0]/20 text-[#8B2FE0] border-[#8B2FE0]/30'
        }`}
      >
        {/* Mini ecualizador: barras animadas mientras suena, planas en pausa */}
        <span className="flex items-end gap-[2px] h-3 w-3.5">
          <span
            className={`w-[3px] rounded-full ${isPlaying ? 'bg-white eq-bar' : 'bg-current h-1.5'}`}
            style={isPlaying ? { height: '100%', animationDelay: '0ms' } : undefined}
          />
          <span
            className={`w-[3px] rounded-full ${isPlaying ? 'bg-white eq-bar' : 'bg-current h-2.5'}`}
            style={isPlaying ? { height: '100%', animationDelay: '180ms' } : undefined}
          />
          <span
            className={`w-[3px] rounded-full ${isPlaying ? 'bg-white eq-bar' : 'bg-current h-1'}`}
            style={isPlaying ? { height: '100%', animationDelay: '340ms' } : undefined}
          />
        </span>
        AUD
      </button>
    </div>
  );
}
