'use client';
// Client: fondo "profundo" para las páginas que en la narrativa ESTRATO van por
// debajo del Hero. Continúa el degradado hacia el basamento y arrastra dos capas de
// isolíneas con parallax de scroll.
//
// La capa lejana va escalada (~1.5×) y con MÁS recorrido que la cercana: es un plano
// Z distinto, más ampliado, para que el descenso se note aunque el fondo sea oscuro.

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FlowPulse } from './FlowPulse';

gsap.registerPlugin(ScrollTrigger);

const PURPLE = '#8B2FE0';

/** Bandas del basamento, de arriba hacia abajo. */
const B1 = 'M0,300 C240,250 460,330 700,380 C940,430 1180,400 1420,350 C1660,300 1840,320 2000,345';
const B2 = 'M0,520 C240,470 460,560 700,610 C940,660 1180,630 1420,580 C1660,530 1840,550 2000,575';
const B3 = 'M0,760 C240,710 460,800 700,850 C940,900 1180,870 1420,820 C1660,770 1840,790 2000,815';
const B4 = 'M0,1000 C240,950 460,1040 700,1090 C940,1140 1180,1110 1420,1060 C1660,1010 1840,1030 2000,1055';

const FLOOR = 2600;

function Band({ d, fill, lineOpacity }: { d: string; fill: string; lineOpacity: number }) {
  return (
    <>
      <path d={`${d} L2000,${FLOOR} L0,${FLOOR} Z`} fill={fill} />
      <path d={d} fill="none" stroke={PURPLE} strokeWidth="2.4" strokeOpacity={lineOpacity} />
    </>
  );
}

export interface DeepStrataBackgroundProps {
  children?: ReactNode;
  className?: string;
}

export function DeepStrataBackground({ children, className = '' }: DeepStrataBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<SVGGElement>(null);
  const nearRef = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const root = rootRef.current;
      if (!root || !farRef.current || !nearRef.current) return;

      const scrollTrigger = { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true } as const;

      gsap.fromTo(farRef.current, { y: 0 }, { y: -1400, ease: 'none', scrollTrigger });
      gsap.fromTo(nearRef.current, { y: 0 }, { y: -420, ease: 'none', scrollTrigger });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Degradado base: sigue bajando desde donde termina el Hero */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#1D1A28_0%,#161320_45%,#0D0A08_100%)]" />

        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 2000 1200"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="wh-deep-grain" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.1" fill="#FFFFFF" fillOpacity="0.14" />
            </pattern>
          </defs>

          {/* Plano lejano: más ampliado y con más recorrido */}
          <g transform="translate(1000,600) scale(1.5) translate(-1000,-600)">
            <g ref={farRef} opacity="0.5">
              <Band d={B1} fill="#1B1726" lineOpacity={0.3} />
              <Band d={B3} fill="#15121F" lineOpacity={0.26} />
            </g>
          </g>

          {/* Plano cercano: las isolíneas y los punticos del parallax del Hero */}
          <g ref={nearRef}>
            <Band d={B2} fill="#100E18" lineOpacity={0.5} />
            <Band d={B4} fill="#0A0810" lineOpacity={0.45} />
            {/* Mismo flujo de luz que en la home: un pulso recorre cada isolínea marcada */}
            {[B2, B4].map((d, i) => (
              <FlowPulse key={i} d={d} duration={15 + i * 4} delay={-i * 6} />
            ))}
            <rect x="0" y="0" width="2000" height={FLOOR} fill="url(#wh-deep-grain)" opacity="0.55" />
          </g>
        </svg>

        {/* Viñeta: mantiene el foco en el contenido */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_40%,transparent_0%,rgba(10,8,16,0.55)_100%)]" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
