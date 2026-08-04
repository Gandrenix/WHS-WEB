'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

export function BedrockSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  // offset en rango -1..1, para el parallax de las capas (foto + niebla)
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Todo el efecto vive en transform/CSS vars (compositing por GPU, sin
    // recalcular layout) y se limita a 1 actualización por frame vía RAF,
    // para que se sienta liviano incluso en equipos modestos.
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const ratioX = (e.clientX - rect.left) / rect.width;
        const ratioY = (e.clientY - rect.top) / rect.height;

        setMousePos({ x: ratioX * 100, y: ratioY * 100 });

        if (!reducedMotionRef.current) {
          setOffset({ x: ratioX * 2 - 1, y: ratioY * 2 - 1 });
        }

        rafRef.current = null;
      });
    };

    const handleMouseLeave = () => {
      setOffset({ x: 0, y: 0 });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Capa de foto: se mueve poco (plano de fondo). Capa de niebla/glow: se
  // mueve más y en sentido contrario (plano cercano). La ilusión de
  // profundidad sale de esa diferencia de velocidad, no de un mapa 3D real.
  const photoX = offset.x * 8;
  const photoY = offset.y * 6;
  const mistX = offset.x * -20;
  const mistY = offset.y * -14;

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
      {/* Plano de fondo: la fotografía, con leve deriva hacia el mouse */}
      <div
        className="absolute -inset-4 transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translate3d(${photoX}px, ${photoY}px, 0) scale(1.08)` }}
      >
        <Image
          src="/images/pale-veil.png"
          alt="Silueta observando la ciudad en la niebla nocturna"
          fill
          sizes="100vw"
          className="object-cover opacity-45"
          priority={false}
        />
      </div>

      {/* Velo oscuro para mantener el texto legible sobre la foto */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A08]/60 via-[#0D0A08]/85 to-[#0D0A08] pointer-events-none" />

      {/* Plano cercano: niebla/resplandor púrpura, deriva más rápido y en contra */}
      <div
        className="absolute -inset-8 bg-gradient-to-b from-[#8B2FE0]/15 via-transparent to-transparent pointer-events-none transition-transform duration-500 ease-out will-change-transform"
        style={{ transform: `translate3d(${mistX}px, ${mistY}px, 0)` }}
      />

      {/* Linterna que sigue al mouse, ya definida en globals.css (.bedrock-flashlight) */}
      <div className="absolute inset-0 bedrock-flashlight bg-white/[0.04] pointer-events-none" />

      {/* Content Area */}
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
