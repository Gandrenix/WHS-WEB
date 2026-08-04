'use client';

import { useState } from 'react';
import Image from 'next/image';
import logoImg from '@/shared/assets/logo.png';
import { MrnaAsciiAnimation } from '@/shared/ui/MrnaAsciiAnimation';

export function InstinctSection() {
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);

  return (
    <section id="instinct" className="py-14 bg-[#F2EDE4] text-[#0D0A08] border-b border-[#3A3532]/15 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* Left Column: Main Manifesto Card */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-xl p-5 sm:p-6 border border-[#3A3532]/20 shadow-md flex flex-col justify-between">
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-[#3A3532]/15 pb-3.5 mb-4 font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#8B2FE0] text-white text-[11px] font-bold rounded">
                  01
                </span>
                <h2 className="text-[11px] uppercase tracking-widest text-[#0D0A08] font-bold">
                  EL INSTINTO &bull; MANIFIESTO
                </h2>
              </div>
              <span className="text-[11px] text-[#8B2FE0] font-bold tracking-wider">WIENER HOUND</span>
            </div>

            {/* Card Body & Text Layout */}
            <div className="flex-1 flex flex-col justify-between my-auto space-y-4">
              <p className="font-fraunces text-base sm:text-lg italic leading-relaxed text-[#0D0A08] font-medium pr-1">
                Perforamos sistemas olvidados. <br />
                Desciframos datos que nadie más ve. <br />
                Damos forma a mundos que incomodan. <br />
                Contamos historias que se quedan debajo de la piel.
              </p>

              {/* Bottom Card Row: Dachshund Image + Tunnel Motto */}
              <div className="pt-3 border-t border-[#3A3532]/10 flex items-center justify-between gap-3 mt-auto">
                <div className="font-mono text-xs font-bold text-[#8B2FE0] tracking-wide leading-tight">
                  No seguimos tendencias. <br />
                  <span className="text-[#0D0A08]">Seguimos túneles.</span>
                </div>

                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src={logoImg}
                    alt="Instinto Dachshund Illustration"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: mRNA BioTech ASCII Animation Card */}
          <div className="lg:col-span-7 bg-[#0D0A08] text-[#F2EDE4] p-5 sm:p-6 rounded-xl border border-white/20 shadow-xl flex flex-col justify-between overflow-hidden min-h-[380px]">
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
                <span>{isAnimationPaused ? '▶' : '⏸'}</span>
                <span>{isAnimationPaused ? 'REANUDAR' : '24 FPS'}</span>
              </button>
            </div>

            {/* Compact ASCII Animation Display */}
            <div className="py-2 flex items-center justify-center overflow-hidden min-h-[280px] bg-black/50 rounded-lg border border-white/10 shadow-inner">
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
