'use client';

import { useRef, useState, useEffect } from 'react';

export function BedrockSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <section
      id="bedrock"
      ref={containerRef}
      className="min-h-[80vh] bg-[#0D0A08] text-[#F2EDE4] py-24 relative overflow-hidden flex flex-col justify-center border-b border-white/10 select-none"
      style={
        {
          '--mouse-x': `${mousePos.x}%`,
          '--mouse-y': `${mousePos.y}%`,
        } as React.CSSProperties
      }
    >
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#8B2FE0]/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Content Area with Native High Legibility & Flashlight Spotlight Enhancer */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Header */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3 font-mono text-sm">
              <span className="px-2.5 py-0.5 bg-[#7A1220] text-white font-bold rounded text-xs">
                04
              </span>
              <span className="text-[#C084FC] font-bold tracking-wider uppercase text-xs">
                BEDROCK &bull; -666 m
              </span>
            </div>
            <h2 className="font-fraunces text-4xl md:text-6xl font-black tracking-tight text-[#F2EDE4] uppercase leading-none">
              Pale Veil
            </h2>
            <p className="font-mono text-xs text-[#C084FC] font-bold tracking-wider uppercase bg-[#8B2FE0]/20 px-3 py-1.5 rounded-lg border border-[#8B2FE0]/40 inline-block">
              NARRATIVA Y EXPERIENCIA INMERSIVA
            </p>
            <p className="font-sans text-sm text-[#F2EDE4]/85 leading-relaxed">
              Exploración narrativa de mundos oscuros y experiencia de horror psicológico. <br />
              <span className="text-[#C084FC] font-mono font-bold">{"// busca. no todo debe ser encontrado."}</span>
            </p>
          </div>

          {/* High Contrast & Clear Poetry Content */}
          <div className="lg:col-span-8 space-y-8 font-fraunces text-center lg:text-left bg-white/5 p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
            <h3 className="text-3xl md:text-5xl italic font-normal text-white leading-tight">
              ¿Qué queda cuando <br />
              <span className="text-[#C084FC] font-semibold not-italic">la memoria</span> se pudre?
            </h3>

            <div className="space-y-4 font-mono text-sm md:text-base text-[#F2EDE4] font-medium">
              <p className="italic text-[#C084FC] font-bold">
                ... el velo respira muy lento.
              </p>
              <p className="tracking-widest text-white font-bold uppercase">
                NO ES TU CORAZÓN. R E C U E R D A.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
