'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Palette, Gamepad2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { SectionStrataBackdrop } from '@/shared/ui/SectionStrataBackdrop';
import { useAudioPlayer } from '@/shared/ui/AudioPlayerProvider';
import { useAudioBars } from '@/shared/hooks/useAudioBars';

/** Cuántas barras dibuja el visualizador de esta tarjeta (el header usa solo 3, acá hay más espacio). */
const BAR_COUNT = 18;

function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function StrataTwoSection() {
  const barRefs = useRef<Array<HTMLElement | null>>([]);
  // Mismo reproductor que el botón del header (ver AudioPlayerProvider en app/layout.tsx):
  // tocar play acá también lo refleja allá, y viceversa — nunca hay dos canciones sonando
  // a la vez por accidente.
  const { songs, currentIndex, isPlaying, isMuted, duration, toggle, toggleMute, selectTrack } = useAudioPlayer();
  useAudioBars(BAR_COUNT, barRefs);

  return (
    <section
      id="strata-2"
      className="py-24 bg-[#161320] text-[#F2EDE4] relative"
    >
      <SectionStrataBackdrop from="#161320" to="#0D0A08" interactive motes />
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3 font-mono text-sm">
            <span className="px-2.5 py-0.5 bg-[#8B2FE0] text-white font-bold rounded text-xs">
              03
            </span>
            <span className="text-[#C084FC] font-bold tracking-wider uppercase text-xs">
              STRATA II &bull; -420 m
            </span>
          </div>
          <h2 className="font-bricolage text-4xl md:text-6xl font-black uppercase text-[#F2EDE4] mb-4 tracking-tight">
            Ingeniería Creativa
          </h2>
          <p className="font-sans text-base text-[#F2EDE4]/80 max-w-3xl leading-relaxed">
            Diseño de entornos 3D, desarrollo de videojuegos interactivos y composición sonora inmersiva. <br />
            <span className="text-[#C084FC] font-mono font-bold">{"// taller. iteración. expresión."}</span>
          </p>
        </div>

        {/* 3 Columns Grid: Blender 3D, Gameplay, Sound Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Column 1: Blender Works — marco de galería, la imagen sangra hasta el borde del cuadro */}
          <div className="fade-up group bg-[#0F0C17] border-2 border-white/15 hover:border-[#C084FC] flex flex-col transition-colors">
            <div className="relative h-52 overflow-hidden border-b-2 border-white/15 group-hover:border-[#C084FC] transition-colors">
              <Image
                src="/images/pale-veil.png"
                alt="Blender 3D Environment Work"
                fill
                className="object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              <span className="absolute bottom-0 left-0 bg-[#0D0A08] text-[#C084FC] font-mono text-[10px] font-bold tracking-widest px-2 py-1">
                FIG. 01 &mdash; WIREFRAME + RENDER FINAL
              </span>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center font-mono text-xs text-[#C084FC] font-bold mb-4">
                <span>BLENDER / 3D ART</span>
                <Palette size={18} strokeWidth={2.25} />
              </div>
              <h3 className="font-bricolage text-2xl font-bold mb-3 text-white">
                Subterranean Outpost
              </h3>
              <p className="font-sans text-sm text-[#F2EDE4]/80 leading-relaxed">
                Modelado de entornos detallados, mapas de texturas PBR e iluminación atmosférica.
              </p>
            </div>
          </div>

          {/* Column 2: Gameplay Prototypes */}
          <div className="fade-up group bg-[#0F0C17] border-2 border-white/15 hover:border-[#C084FC] flex flex-col transition-colors">
            <div className="relative h-52 overflow-hidden border-b-2 border-white/15 group-hover:border-[#C084FC] transition-colors cursor-pointer">
              <Image
                src="/images/umbral.png"
                alt="Gameplay Prototype"
                fill
                className="object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              <span className="absolute bottom-0 left-0 bg-[#0D0A08] text-[#C084FC] font-mono text-[10px] font-bold tracking-widest px-2 py-1">
                FIG. 02 &mdash; PROTOTIPO JUGABLE
              </span>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#8B2FE0] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play size={22} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center font-mono text-xs text-[#C084FC] font-bold mb-4">
                <span>UNITY / ROBLOX GAMEPLAY</span>
                <Gamepad2 size={18} strokeWidth={2.25} />
              </div>
              <h3 className="font-bricolage text-2xl font-bold mb-3 text-white">
                Echoes Beneath
              </h3>
              <p className="font-sans text-sm text-[#F2EDE4]/80 leading-relaxed">
                Desarrollo de prototipos interactivos con mecánicas de exploración y sistemas narrativos.
              </p>
            </div>
          </div>

          {/* Column 3: Integrated Ambient Audio Player */}
          <div className="fade-up bg-[#0F0C17] border-2 border-white/15 hover:border-[#C084FC] flex flex-col transition-colors">
            <div className="relative h-52 overflow-hidden border-b-2 border-white/15 bg-gradient-to-br from-[#241E32] to-[#0D0A08] flex items-center justify-center">
              <Volume2 size={40} strokeWidth={1.25} className="text-[#C084FC]/40" />
              <span className="absolute bottom-0 left-0 bg-[#0D0A08] text-[#C084FC] font-mono text-[10px] font-bold tracking-widest px-2 py-1">
                FIG. 03 &mdash; DISEÑO SONORO
              </span>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center font-mono text-xs text-[#C084FC] font-bold mb-4">
                <span>SOUND DESIGN</span>
                <Volume2 size={18} strokeWidth={2.25} />
              </div>
              <h3 className="font-bricolage text-2xl font-bold mb-3 text-white">
                Dark Ambient Collection
              </h3>
              <p className="font-sans text-sm text-[#F2EDE4]/80 leading-relaxed mb-4">
                Diseño de sonido ambiental con reverberación espacial y paisajes sonoros inmersivos.
              </p>

              {/* Audio Player Box — mismo reproductor que el botón del header, ver arriba */}
              <div className="relative bg-[#0D0A08] p-5 border border-[#8B2FE0]/40 font-mono">
                {/* Barras reactivas al espectro real de lo que suena (useAudioBars); si no
                    hay nada sonando o el navegador no pudo leer el audio, caen a un pulso
                    CSS aproximado en vez de quedarse planas. */}
                <div className="flex items-center gap-1 h-12 mb-4 px-2 bg-black/40">
                  {Array.from({ length: BAR_COUNT }).map((_, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        barRefs.current[i] = el;
                      }}
                      className="flex-1 origin-bottom transition-[height] duration-75 bg-white/30"
                      style={{ height: isPlaying ? '20%' : '25%' }}
                    />
                  ))}
                </div>

                {/* Playlist: viene de Supabase (/admin/dashboard/música), no hardcodeada.
                    Alto fijo con scroll propio — más canciones no estiran la tarjeta. */}
                {songs.length === 0 ? (
                  <p className="text-white/50 text-xs italic mb-4 px-2">
                    Sin canciones publicadas todavía.
                  </p>
                ) : (
                  <div className="space-y-1.5 mb-4 text-xs max-h-40 overflow-y-auto pr-1">
                    {songs.map((song, idx) => {
                      const isCurrent = idx === currentIndex;
                      return (
                        <button
                          key={song.id}
                          onClick={() => selectTrack(idx)}
                          className={`w-full flex justify-between items-center gap-2 p-2 transition-colors text-left cursor-pointer ${
                            isCurrent
                              ? 'bg-[#8B2FE0]/30 text-[#C084FC] font-bold border border-[#8B2FE0]/50'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">
                            {String(idx + 1).padStart(2, '0')}. {song.title}
                          </span>
                          <span className="text-[11px] opacity-70 shrink-0">
                            {isCurrent ? formatDuration(duration) : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Controls Bar */}
                <div className="flex justify-between items-center pt-3 border-t border-white/10 text-xs">
                  <button
                    onClick={toggle}
                    disabled={songs.length === 0}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                    {isPlaying ? 'PAUSA' : 'REPRODUCIR'}
                  </button>
                  <button
                    onClick={toggleMute}
                    disabled={songs.length === 0}
                    className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    {isMuted ? 'SILENCIADO' : 'SONIDO'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
