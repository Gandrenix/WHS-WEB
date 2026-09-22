'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Pause } from 'lucide-react';
import logoImg from '@/shared/assets/logo.png';
import { MrnaAsciiAnimation } from '@/shared/ui/MrnaAsciiAnimation';
import { SectionStrataBackdrop } from '@/shared/ui/SectionStrataBackdrop';

export function InstinctSection() {
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);

  return (
    <section id="instinct" className="py-14 bg-[#24202F] text-[#F2EDE4] relative">
      <SectionStrataBackdrop from="#24202F" to="#1D1A28" interactive />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* Left Column: Main Manifesto Card — cita editorial con barra de acento, no ficha técnica */}
          <div className="lg:col-span-7 bg-[#0F0C17]/85 border-2 border-white/15 border-l-8 border-l-[#8B2FE0] p-5 sm:p-8 flex flex-col justify-between">
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3.5 mb-4 font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#8B2FE0] text-white text-[11px] font-bold rounded">
                  01
                </span>
                <h2 className="text-[11px] uppercase tracking-widest text-[#F2EDE4] font-bold">
                  EL INSTINTO &bull; MANIFIESTO
                </h2>
              </div>
              <span className="text-[11px] text-[#8B2FE0] font-bold tracking-wider">WIENER HOUND</span>
            </div>

            {/* Card Body & Text Layout */}
            <div className="flex-1 flex flex-col justify-between my-auto space-y-4">
              <div className="font-fraunces text-sm sm:text-base italic leading-relaxed text-[#F2EDE4] font-medium pr-1 sm:columns-2 sm:gap-8">
                <p className="break-inside-avoid mb-3">
                  Arriba, <br />
                  la superficie se embriaga de luz <br />
                  para olvidar que está cayendo. <br />
                  Se conforma con el eco. <br />
                  Con la mentira pulcra de lo visible.
                </p>
                <p className="break-inside-avoid mb-3">Nosotros vamos al fondo.</p>
                <p className="break-inside-avoid mb-3">
                  Allí donde la tierra se compacta <br />
                  hasta sofocar cualquier palabra. <br />
                  Allí donde las cosas pesan de verdad.
                </p>
                <p className="break-inside-avoid mb-3">
                  No nos interesa el llanto que pide un testigo. <br />
                  Buscamos el óxido silencioso. <br />
                  La fatiga del metal que nadie inspecciona. <br />
                  El punto exacto donde la piedra <br />
                  aprende a romperse.
                </p>
                <p className="break-inside-avoid mb-3">
                  Porque el silencio nunca ha sido paz: <br />
                  es la estructura resistiendo. <br />
                  Es la carne del cimiento <br />
                  sosteniendo un peso <br />
                  que ni siquiera sabe que existe.
                </p>
                <p className="break-inside-avoid mb-3">
                  Sin aplausos. <br />
                  Sin nombres. <br />
                  Solo la roca, la fisura y la gravedad.
                </p>
              </div>

              {/* Bottom Card Row: Dachshund Image + Tunnel Motto */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 mt-auto">
                <div className="font-mono text-xs font-bold text-[#C084FC] tracking-wide leading-tight">
                  No buscamos caminos abiertos. <br />
                  <span className="text-[#F2EDE4]">Seguimos el túnel.</span>
                </div>

                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src={logoImg}
                    alt="Instinto Dachshund Illustration"
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: mRNA BioTech ASCII Animation Card */}
          <div className="lg:col-span-5 bg-[#0A0810] text-[#F2EDE4] p-5 sm:p-6 border-2 border-[#7ED957]/30 flex flex-col justify-between min-h-[380px]">
            {/* Box Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3.5 mb-4 font-mono">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAnimationPaused ? 'bg-[#FBBF24]' : 'bg-[#7ED957]'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isAnimationPaused ? 'bg-[#FBBF24]' : 'bg-[#7ED957]'}`}></span>
                </span>
                <span className="text-[#7ED957] font-bold tracking-widest uppercase text-xs">
                  SECUENCIACIÓN MRNA &bull; ASCII STREAM
                </span>
              </div>

              {/* Interactive Play/Pause Button */}
              <button
                onClick={() => setIsAnimationPaused(!isAnimationPaused)}
                type="button"
                className="text-xs font-mono font-bold bg-white/10 hover:bg-white/20 active:scale-95 text-white px-2.5 py-1 rounded border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                title={isAnimationPaused ? 'Reanudar secuencia' : 'Pausar secuencia'}
              >
                {isAnimationPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
                <span>{isAnimationPaused ? 'REANUDAR' : '24 FPS'}</span>
              </button>
            </div>

            {/* Compact ASCII Animation Display */}
            {/* flex sin items-center: el hijo se estira a todo el alto y la propia
                animación se encarga de centrarse y llenar su caja. */}
            <div className="flex flex-1 overflow-hidden min-h-[280px] bg-black/50 border border-white/10 shadow-inner">
              <MrnaAsciiAnimation color="#C084FC" fontSize={8.5} isPaused={isAnimationPaused} />
            </div>

            {/* Box Footer */}
            <div className="pt-3 mt-4 border-t border-white/15 flex justify-between items-center font-mono text-xs text-white/70 font-bold">
              <span className="tracking-wider">PIPELINE: <span className="text-white">SOMACORE.RAW</span></span>
              {isAnimationPaused ? (
                <span className="text-[#FBBF24] bg-[#FBBF24]/10 px-2.5 py-0.5 rounded border border-[#FBBF24]/30 tracking-widest font-bold">
                  PAUSADO
                </span>
              ) : (
                <span className="text-[#7ED957] bg-[#7ED957]/10 px-2.5 py-0.5 rounded border border-[#7ED957]/30 tracking-widest animate-pulse font-bold">
                  SINTETIZANDO
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
