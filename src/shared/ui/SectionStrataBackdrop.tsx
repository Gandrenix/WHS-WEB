'use client';
// Client: fondo de sección para los estratos de la home. Continúa el descenso del Hero
// con isolíneas en dos planos de parallax (GSAP ScrollTrigger), punticos de grano y un
// pulso de luz que recorre las curvas. Con `interactive`, las isolíneas y los punticos
// se encienden alrededor del cursor. Con `motes`, suben motas de polvo.

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { wavePath } from '@/shared/lib/wave';
import { usePauseWhenOffscreen } from '@/shared/hooks/usePauseWhenOffscreen';
import { FlowPulse } from './FlowPulse';

gsap.registerPlugin(ScrollTrigger);

const PURPLE = '#8B2FE0';
const VB_W = 1440;

/** Todo lo que no es el degradado base se desvanece hacia los bordes de la sección. */
const EDGE_FADE = 'linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)';
/** Foco de luz alrededor del cursor (--mx/--my los actualiza el listener de pointermove). */
const SPOT = 'radial-gradient(circle 230px at var(--mx, -500px) var(--my, -500px), #000 0%, transparent 100%)';

const wave = (y: number, amp: number, phase: number) => wavePath(y, amp, phase, VB_W);

/** [baseY, amplitud, fase] de cada isolínea en un viewBox de 1440×1000. */
const FAR_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [180, 34, 0.2],
  [380, 40, 1.4],
  [580, 30, 2.6],
  [780, 36, 3.8],
  [960, 32, 5.0],
];
const NEAR_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [270, 46, 0.6],
  [500, 52, 2.0],
  [720, 44, 3.2],
  [910, 50, 4.4],
];

/** [left %, top %, tamaño px, duración s, retraso s] — fijos para no romper la hidratación. */
const MOTES: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [6, 82, 3, 17, 0], [14, 58, 2, 21, 4], [23, 90, 4, 19, 8], [31, 66, 2, 23, 2],
  [39, 84, 3, 18, 11], [47, 52, 2, 22, 6], [55, 92, 4, 20, 1], [63, 70, 2, 24, 9],
  [71, 86, 3, 17, 5], [79, 60, 2, 21, 13], [86, 94, 4, 19, 3], [93, 74, 3, 23, 7],
  [10, 40, 2, 25, 10], [52, 34, 2, 22, 14], [76, 30, 3, 26, 12], [96, 48, 2, 20, 15],
];

const DOTS =
  '[background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.16)_1px,transparent_0)] [background-size:26px_26px]';

export interface SectionStrataBackdropProps {
  /** Color del degradado en el borde superior de la sección. */
  from: string;
  /** Color del degradado en el borde inferior. */
  to: string;
  /** Las isolíneas y los punticos se encienden alrededor del cursor. */
  interactive?: boolean;
  /** Motas de polvo que ascienden. */
  motes?: boolean;
}

export function SectionStrataBackdrop({ from, to, interactive = false, motes = false }: SectionStrataBackdropProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const nearLitRef = useRef<HTMLDivElement>(null);

  usePauseWhenOffscreen(rootRef);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !farRef.current || !nearRef.current) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!reduced) {
        const scrollTrigger = { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } as const;
        // El plano lejano se queda atrás respecto al contenido (baja); el cercano
        // se adelanta (sube). Ambos wrappers sobresalen 300px por arriba y por abajo.
        // La copia "encendida" comparte tween con el plano cercano para coincidir con él.
        gsap.fromTo(farRef.current, { y: -160 }, { y: 160, ease: 'none', scrollTrigger });
        gsap.fromTo(
          [nearRef.current, nearLitRef.current].filter(Boolean),
          { y: 100 },
          { y: -100, ease: 'none', scrollTrigger }
        );
      }

      // La sección (padre) recibe el puntero; el fondo en sí tiene pointer-events-none.
      const host = root.parentElement;
      if (!interactive || reduced || !host) return;

      let frame = 0;
      const onMove = (e: PointerEvent) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const box = root.getBoundingClientRect();
          root.style.setProperty('--mx', `${e.clientX - box.left}px`);
          root.style.setProperty('--my', `${e.clientY - box.top}px`);
        });
      };
      const onLeave = () => {
        root.style.setProperty('--mx', '-500px');
        root.style.setProperty('--my', '-500px');
      };
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
      return () => {
        cancelAnimationFrame(frame);
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: rootRef, dependencies: [interactive] }
  );

  return (
    <div ref={rootRef} data-inview="true" className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)` }} />

      {/* Todo lo que no es el degradado base se desvanece hacia los bordes: así en la
          frontera con la sección vecina solo queda el color base (idéntico en ambas)
          y no se ve ninguna costura de bandas ni punticos cortados en seco. */}
      <div className="absolute inset-0" style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}>
        {/* Plano lejano: bandas tenues + isolíneas finas */}
        <div ref={farRef} className="absolute inset-x-0 -inset-y-[300px]">
          <svg className="h-full w-full" viewBox={`0 0 ${VB_W} 1000`} preserveAspectRatio="none">
            {FAR_LINES.map(([y, amp, phase], i) => {
              const d = wave(y, amp, phase);
              return (
                <g key={i}>
                  {i % 2 === 1 && <path d={`${d} L${VB_W},1000 L0,1000 Z`} fill="#FFFFFF" fillOpacity="0.028" />}
                  <path d={d} fill="none" stroke={PURPLE} strokeOpacity="0.28" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Plano cercano: isolíneas más marcadas, punticos de grano y pulsos de luz */}
        <div ref={nearRef} className="absolute inset-x-0 -inset-y-[300px]">
          <div className={`absolute inset-0 opacity-70 ${DOTS}`} />
          <svg className="relative h-full w-full" viewBox={`0 0 ${VB_W} 1000`} preserveAspectRatio="none">
            {NEAR_LINES.map(([y, amp, phase], i) => (
              <path key={i} d={wave(y, amp, phase)} fill="none" stroke={PURPLE} strokeOpacity="0.55" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
            ))}
            {NEAR_LINES.map(([y, amp, phase], i) => (
              <FlowPulse key={i} d={wave(y, amp, phase)} duration={13 + i * 3} delay={-i * 4} nonScaling />
            ))}
          </svg>
        </div>

        {/* Copia "encendida" del plano cercano: solo se ve dentro del foco del cursor */}
        {interactive && (
          <div className="absolute inset-0" style={{ maskImage: SPOT, WebkitMaskImage: SPOT }}>
            <div ref={nearLitRef} className="absolute inset-x-0 -inset-y-[300px]">
              <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(224,170,255,0.75)_1.4px,transparent_0)] [background-size:26px_26px]" />
              <svg className="relative h-full w-full" viewBox={`0 0 ${VB_W} 1000`} preserveAspectRatio="none">
                {NEAR_LINES.map(([y, amp, phase], i) => (
                  <path key={i} d={wave(y, amp, phase)} fill="none" stroke="#C084FC" strokeOpacity="0.95" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
            </div>
          </div>
        )}

        {motes &&
          MOTES.map(([left, top, size, dur, delay], i) => (
            <span
              key={i}
              className="strata-mote absolute rounded-full bg-[#C084FC] opacity-40"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                ['--dur' as string]: `${dur}s`,
                ['--delay' as string]: `${-delay}s`,
              }}
            />
          ))}
      </div>
    </div>
  );
}
