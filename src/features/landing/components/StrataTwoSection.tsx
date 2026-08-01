'use client';

import { useState } from 'react';
import Image from 'next/image';

const AUDIO_TRACKS = [
  { id: 1, title: '01. Abyssal Current', duration: '03:24' },
  { id: 2, title: '02. Subterranean Drift', duration: '04:11' },
  { id: 3, title: '03. Pale Veil Suite', duration: '06:47' },
  { id: 4, title: '04. Echoes Below', duration: '05:02' },
];

export function StrataTwoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <section
      id="strata-2"
      className="py-24 bg-[#2B1B14] text-[#F2EDE4] border-b border-white/10 relative"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
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
          {/* Column 1: Blender Works */}
          <div className="bg-[#160E0A] rounded-2xl p-6 md:p-8 border border-white/15 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex justify-between items-center font-mono text-xs text-[#C084FC] font-bold mb-4">
                <span>BLENDER / 3D ART</span>
                <span className="text-xl">🎨</span>
              </div>
              <h3 className="font-bricolage text-2xl font-bold mb-3 text-white">
                Subterranean Outpost
              </h3>
              <p className="font-sans text-sm text-[#F2EDE4]/80 leading-relaxed mb-6">
                Modelado de entornos detallados, mapas de texturas PBR e iluminación atmosférica.
              </p>
            </div>

            <div className="relative h-52 rounded-xl overflow-hidden border border-white/15 group">
              <Image
                src="/images/pale-veil.png"
                alt="Blender 3D Environment Work"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="font-mono text-xs font-bold text-[#C084FC]">Wireframe + Render Final</span>
              </div>
            </div>
          </div>

          {/* Column 2: Gameplay Prototypes */}
          <div className="bg-[#160E0A] rounded-2xl p-6 md:p-8 border border-white/15 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex justify-between items-center font-mono text-xs text-[#C084FC] font-bold mb-4">
                <span>UNITY / ROBLOX GAMEPLAY</span>
                <span className="text-xl">🎮</span>
              </div>
              <h3 className="font-bricolage text-2xl font-bold mb-3 text-white">
                Echoes Beneath
              </h3>
              <p className="font-sans text-sm text-[#F2EDE4]/80 leading-relaxed mb-6">
                Desarrollo de prototipos interactivos con mecánicas de exploración y sistemas narrativos.
              </p>
            </div>

            <div className="relative h-52 rounded-xl overflow-hidden border border-white/15 group cursor-pointer">
              <Image
                src="/images/umbral.png"
                alt="Gameplay Prototype"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#8B2FE0] text-white flex items-center justify-center text-xl pl-1 shadow-xl group-hover:scale-110 transition-transform">
                  ▶
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Integrated Ambient Audio Player */}
          <div className="bg-[#160E0A] rounded-2xl p-6 md:p-8 border border-white/15 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex justify-between items-center font-mono text-xs text-[#C084FC] font-bold mb-4">
                <span>SOUND DESIGN</span>
                <span className="text-xl">🔊</span>
              </div>
              <h3 className="font-bricolage text-2xl font-bold mb-3 text-white">
                Dark Ambient Collection
              </h3>
              <p className="font-sans text-sm text-[#F2EDE4]/80 leading-relaxed mb-4">
                Diseño de sonido ambiental con reverberación espacial y paisajes sonoros inmersivos.
              </p>
            </div>

            {/* Audio Player Box */}
            <div className="bg-[#0D0A08] p-5 rounded-xl border border-[#8B2FE0]/40 font-mono">
              {/* Waveform Visualizer simulation */}
              <div className="flex items-center gap-1 h-12 mb-4 px-2 bg-black/40 rounded-lg">
                {[40, 70, 30, 90, 60, 100, 45, 80, 65, 30, 85, 50, 95, 40, 70, 35, 90, 60].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      isPlaying ? 'bg-[#8B2FE0] animate-pulse' : 'bg-white/30'
                    }`}
                    style={{ height: isPlaying ? `${h}%` : '25%' }}
                  />
                ))}
              </div>

              {/* Playlist */}
              <div className="space-y-1.5 mb-4 text-xs">
                {AUDIO_TRACKS.map((track, idx) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setCurrentTrack(idx);
                      setIsPlaying(true);
                    }}
                    className={`w-full flex justify-between p-2 rounded transition-colors text-left cursor-pointer ${
                      currentTrack === idx
                        ? 'bg-[#8B2FE0]/30 text-[#C084FC] font-bold border border-[#8B2FE0]/50'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{track.title}</span>
                    <span className="text-[11px] opacity-70">{track.duration}</span>
                  </button>
                ))}
              </div>

              {/* Controls Bar */}
              <div className="flex justify-between items-center pt-3 border-t border-white/10 text-xs">
                <button
                  onClick={togglePlay}
                  className="px-4 py-1.5 bg-[#8B2FE0] hover:bg-[#C084FC] text-white rounded-lg font-bold transition-all cursor-pointer shadow-md"
                >
                  {isPlaying ? '⏸ PAUSA' : '▶ REPRODUCIR'}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-white/70 hover:text-white text-xs font-bold cursor-pointer"
                >
                  {isMuted ? '🔇 SILENCIADO' : '🔊 SONIDO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
