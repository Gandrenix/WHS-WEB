'use client';
// Client: isla pequeña para el logo interactivo con reproductor de música de ambiente.
// El reproductor en sí (playlist, audio real, analizador) vive en AudioPlayerProvider
// (raíz del sitio, ver app/layout.tsx) — este componente solo es una de sus vistas, la
// misma que controla la tarjeta "Diseño Sonoro" de STRATA II (ver StrataTwoSection).

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Music, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import logoImg from '@/shared/assets/logo.png';
import logoPlayingImg from '@/shared/assets/logo-playing.png';
import { useAudioPlayer } from '@/shared/ui/AudioPlayerProvider';
import { useAudioBars } from '@/shared/hooks/useAudioBars';

export interface LogoAudioPlayerProps {
  isDark?: boolean;
}

export function LogoAudioPlayer({ isDark = false }: LogoAudioPlayerProps) {
  const barRefs = useRef<Array<HTMLElement | null>>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const [listOpen, setListOpen] = useState(false);

  const { songs, currentSong, currentIndex, isPlaying, toggle, selectTrack, next, prev } = useAudioPlayer();
  useAudioBars(3, barRefs);

  // Cierra la lista al hacer clic fuera (no es un <details>/popover nativo porque
  // seleccionar una pista debe disparar play(), no solo abrir/cerrar).
  useEffect(() => {
    if (!listOpen) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setListOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [listOpen]);

  const hasSongs = songs.length > 0;

  return (
    <div ref={rootRef} className="relative flex items-center gap-3">
      <Link href="/" className="logo flex items-center group relative">
        {/* El contenedor mide siempre lo mismo (no afecta la altura del header).
            logo-playing.png se escala visualmente por encima de ese tamaño con
            transform -se sale del box sin empujar nada- para verse más grande. */}
        <div className="relative w-[80px] h-[80px]">
          <Image
            src={isPlaying ? logoPlayingImg : logoImg}
            alt="Wiener Hound Studios Logo"
            fill
            sizes="120px"
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

      {/* Sin canciones subidas todavía (admin/dashboard/musica vacío): el botón no se
          muestra en vez de ofrecer un reproductor que no puede reproducir nada. */}
      {hasSongs && (
        <div className="hidden sm:flex items-stretch">
          <button
            onClick={toggle}
            type="button"
            title={isPlaying ? 'Pausar música de ambiente' : 'Reproducir música de ambiente'}
            aria-label={isPlaying ? 'Pausar música de ambiente' : 'Reproducir música de ambiente'}
            className={`flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-l-full text-xs font-mono font-bold transition-all cursor-pointer border border-r-0 ${
              isPlaying
                ? 'bg-[#8B2FE0] border-[#8B2FE0] text-white shadow-[0_0_14px_rgba(139,47,224,0.55)]'
                : 'bg-[#8B2FE0]/10 hover:bg-[#8B2FE0]/20 text-[#8B2FE0] border-[#8B2FE0]/30'
            }`}
          >
            {/* Ecualizador reactivo: cada barra sigue una banda del espectro real de la
                canción (ver useAudioBars). Si el navegador no puede leer el audio (CORS),
                cae sola al pulso .eq-bar por CSS. */}
            <span className="flex items-end gap-[2px] h-3 w-3.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  ref={(el) => {
                    barRefs.current[i] = el;
                  }}
                  className={`w-[3px] rounded-full origin-bottom transition-[height] duration-75 ${
                    isPlaying ? 'bg-white' : 'bg-current'
                  }`}
                  style={{ height: isPlaying ? '35%' : i === 0 ? '50%' : i === 1 ? '100%' : '35%' }}
                />
              ))}
            </span>
            AUD
          </button>

          <button
            type="button"
            onClick={() => setListOpen((v) => !v)}
            aria-label="Ver playlist"
            aria-expanded={listOpen}
            className={`flex items-center px-1.5 rounded-r-full border transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#8B2FE0] border-[#8B2FE0] text-white'
                : 'bg-[#8B2FE0]/10 hover:bg-[#8B2FE0]/20 text-[#8B2FE0] border-[#8B2FE0]/30'
            }`}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${listOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Playlist: panel flotante de tamaño fijo (no reordena el header) con scroll
          propio — subir 30 canciones no debería estirar nada, solo scrollear la lista. */}
      {listOpen && hasSongs && (
        <div
          className={`absolute left-0 top-full mt-2 w-72 rounded-2xl border shadow-2xl overflow-hidden z-[90] ${
            isDark ? 'bg-[#120A08] border-white/15' : 'bg-white border-[#3A3532]/15'
          }`}
        >
          <div
            className={`flex items-center justify-between px-3 py-2 border-b ${
              isDark ? 'border-white/10' : 'border-[#3A3532]/10'
            }`}
          >
            <div className="min-w-0 flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-[#8B2FE0] shrink-0" />
              <span
                className={`text-xs font-mono font-bold truncate ${isDark ? 'text-white' : 'text-[#0D0A08]'}`}
                title={currentSong?.title}
              >
                {currentSong?.title ?? 'Playlist'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={prev}
                aria-label="Canción anterior"
                className="p-1.5 rounded-lg hover:bg-[#8B2FE0]/15 text-[#8B2FE0] cursor-pointer"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                className="p-1.5 rounded-lg hover:bg-[#8B2FE0]/15 text-[#8B2FE0] cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Canción siguiente"
                className="p-1.5 rounded-lg hover:bg-[#8B2FE0]/15 text-[#8B2FE0] cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <ul className="max-h-64 overflow-y-auto py-1 font-mono">
            {songs.map((song, i) => {
              const isCurrent = i === currentIndex;
              return (
                <li key={song.id}>
                  <button
                    type="button"
                    onClick={() => selectTrack(i)}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#8B2FE0]/15 text-[#8B2FE0] font-bold'
                        : isDark
                          ? 'text-white/70 hover:bg-white/5 hover:text-white'
                          : 'text-[#3A3532] hover:bg-black/5'
                    }`}
                  >
                    <span className="w-4 shrink-0 text-center">{isCurrent && isPlaying ? '♪' : i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{song.title}</span>
                      {song.artist && <span className="block truncate text-[10px] opacity-60">{song.artist}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

