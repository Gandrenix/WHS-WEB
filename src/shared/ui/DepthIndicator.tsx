'use client';
// Client: rail de scroll con GSAP/ScrollTrigger; la posición continua del marcador
// vive fuera de React state (mutación directa de estilo vía ref) para no re-renderizar
// en cada frame de scroll — solo el nivel activo y las proporciones de banda (que
// cambian poco) usan useState.
//
// El nivel activo se decide con el MISMO criterio que useActiveSection (navbar):
// "la sección cuyo borde superior ya pasó la mitad del viewport". Si este archivo
// y el navbar usaran criterios distintos, header y rail podrían mostrar secciones
// activas diferentes al mismo tiempo — por eso deben coincidir exactamente.

import { useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import pawIcon from '@/shared/assets/paw-icon.png';
import { scrollToSection } from '@/shared/lib/smoothScroll';

gsap.registerPlugin(ScrollTrigger);

const STRATA_LEVELS = [
  { id: 'superficie', name: 'SUPERFICIE', depth: '0m', code: '00', band: '#F2EDE4' },
  { id: 'strata-1', name: 'STRATA I', depth: '-120m', code: '01', band: '#918799' },
  { id: 'strata-2', name: 'STRATA II', depth: '-420m', code: '02', band: '#4C455A' },
  { id: 'bedrock', name: 'BEDROCK', depth: '-666m', code: '03', band: '#1B1726' },
  { id: 'resurface', name: 'RESURFACED', depth: 'END', code: '04', band: '#F2EDE4' },
];

/** % de scroll (0-100) al que arranca cada nivel, medido contra las secciones reales del DOM — solo para el tamaño decorativo de las bandas, no decide el nivel activo. */
function measureBandBoundaries(): number[] {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (total <= 0) return STRATA_LEVELS.map((_, i) => (i / STRATA_LEVELS.length) * 100);

  const raw = STRATA_LEVELS.map((level) => {
    const el = document.getElementById(level.id);
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return Math.min(100, Math.max(0, (top / total) * 100));
  });

  for (let i = 1; i < raw.length; i++) {
    raw[i] = Math.max(raw[i], raw[i - 1]);
  }
  return raw;
}

/** Profundidad (m) en el arranque de cada nivel; al final de la página se vuelve a 0 (emerge). */
const LEVEL_DEPTH_M = [0, -120, -420, -666, -666];

/** Posición (scrollY absoluto) del borde superior de cada sección. Se mide una vez y se
 *  re-mide al cambiar el layout: leer getBoundingClientRect en cada frame de scroll
 *  forzaba un layout por fotograma. */
function measureSectionTops(): number[] {
  return STRATA_LEVELS.map((level) => {
    const el = document.getElementById(level.id);
    return el ? el.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY;
  });
}

/** Sección activa: la última cuyo borde superior ya cruzó la mitad del viewport — idéntico a useActiveSection. */
function detectActiveIndex(tops: number[], scrollY: number, viewportH: number): number {
  for (let i = STRATA_LEVELS.length - 1; i >= 0; i--) {
    if (tops[i] - scrollY <= viewportH / 2) return i;
  }
  return 0;
}

/** Profundidad en metros para un scroll dado, interpolada entre los niveles. */
function depthAt(tops: number[], scrollY: number, maxScroll: number): number {
  const stops = [...tops.map((t, i) => [Math.min(t, maxScroll), LEVEL_DEPTH_M[i]] as const), [maxScroll, 0] as const];
  for (let i = stops.length - 1; i > 0; i--) {
    const [y0, d0] = stops[i - 1];
    const [y1, d1] = stops[i];
    if (scrollY >= y0 && y1 > y0) return d0 + ((d1 - d0) * (scrollY - y0)) / (y1 - y0);
  }
  return 0;
}

export function DepthIndicator() {
  const asideRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const [activeStrata, setActiveStrata] = useState('superficie');
  const [boundaries, setBoundaries] = useState<number[]>(() =>
    STRATA_LEVELS.map((_, i) => (i / STRATA_LEVELS.length) * 100)
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const depthRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useGSAP(
    () => {
      const fill = fillRef.current;
      const marker = markerRef.current;
      const track = trackRef.current;
      if (!fill || !marker || !track) return;

      let tops = measureSectionTops();
      let trackH = track.clientHeight;
      let maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      let activeIdx = -1;

      const remeasure = () => {
        tops = measureSectionTops();
        trackH = track.clientHeight;
        maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        setBoundaries(measureBandBoundaries());
        ScrollTrigger.refresh();
      };
      setBoundaries(measureBandBoundaries());
      // El layout puede asentarse tarde (fuentes, imágenes, datos de Supabase),
      // así que remedimos tras cargar todo, en cada resize y si la página cambia de alto.
      window.addEventListener('load', remeasure);
      window.addEventListener('resize', remeasure);
      const settleTimer = window.setTimeout(remeasure, 600);
      let lastPageH = document.documentElement.scrollHeight;
      const pageObserver = new ResizeObserver(() => {
        const h = document.documentElement.scrollHeight;
        if (Math.abs(h - lastPageH) > 2) {
          lastPageH = h;
          remeasure();
        }
      });
      pageObserver.observe(document.body);

      // Una sola fuente de verdad para el % de scroll. Relleno y marcador se mueven con
      // `transform` (compositor) en vez de height/top (que forzaban layout en cada frame).
      // La profundidad en vivo solo toca el texto del nivel activo.
      const st = ScrollTrigger.create({
        start: 0,
        end: () => document.documentElement.scrollHeight - window.innerHeight,
        onUpdate: (self) => {
          const p = self.progress;
          fill.style.transform = `scaleY(${p})`;
          marker.style.transform = `translate3d(-50%, ${p * trackH}px, 0) translateY(-50%)`;

          const idx = detectActiveIndex(tops, window.scrollY, window.innerHeight);
          if (idx !== activeIdx) {
            // restaura la cota nominal del nivel que se deja
            if (activeIdx >= 0) {
              const prev = depthRefs.current[activeIdx];
              if (prev) prev.textContent = STRATA_LEVELS[activeIdx].depth;
            }
            activeIdx = idx;
            setActiveStrata(STRATA_LEVELS[idx].id);
          }
          const live = depthRefs.current[idx];
          if (live && idx < STRATA_LEVELS.length - 1) {
            live.textContent = `${depthAt(tops, window.scrollY, maxScroll).toFixed(1)}m`;
          }
        },
      });

      return () => {
        st.kill();
        pageObserver.disconnect();
        window.removeEventListener('load', remeasure);
        window.removeEventListener('resize', remeasure);
        window.clearTimeout(settleTimer);
      };
    },
    { scope: asideRef }
  );

  const bandHeights = STRATA_LEVELS.map((_, i) => {
    const start = boundaries[i] ?? (i / STRATA_LEVELS.length) * 100;
    const end = boundaries[i + 1] ?? 100;
    return Math.max(0, end - start);
  });

  return (
    <aside
      ref={asideRef}
      aria-label="Indicador de Profundidad ESTRATO"
      className="fixed right-0 bottom-0 w-[50px] md:w-[130px] z-[70] bg-[#0D0A08] text-[#F2EDE4] border-l border-white/15 flex flex-col justify-between py-6 px-1 md:px-3 font-mono select-none"
      style={{ top: 'var(--header-height, 66px)' }}
    >
      {/* "Track" único: bandas, relleno y marcador viven todos dentro de esta MISMA caja,
          así comparten exactamente el mismo eje X (centrado) y el mismo rango 0-100% en Y.
          Antes el marcador era hermano del riel y su posición se calculaba a mano con
          píxeles fijos contra el <aside> completo — por eso se veía corrido a la izquierda
          y su recorrido no respetaba el alto real de la barra. */}
      <div ref={trackRef} className="absolute left-2.5 md:left-4 top-10 bottom-10 w-[6px]">
        {/* Bandas de color por estrato */}
        <div className="absolute inset-0 rounded-full overflow-hidden flex flex-col shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
          {STRATA_LEVELS.map((level, i) => (
            <div
              key={level.id}
              className="relative transition-[flex-basis] duration-300"
              style={{
                flexBasis: `${bandHeights[i]}%`,
                flexGrow: 0,
                flexShrink: 0,
                background: level.band,
                borderBottom:
                  i < STRATA_LEVELS.length - 1
                    ? i === STRATA_LEVELS.length - 2
                      ? '2px solid #8B2FE0'
                      : '1px solid rgba(0,0,0,0.35)'
                    : 'none',
              }}
            >
              {i < STRATA_LEVELS.length - 1 && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(115deg, transparent 0 3px, rgba(0,0,0,0.4) 3px 5px)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Relleno de avance: gradiente sólido + halo, visible sobre cualquier banda (clara u oscura) */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div
            ref={fillRef}
            className="h-full w-full origin-top bg-gradient-to-b from-[#C084FC] to-[#8B2FE0] shadow-[0_0_12px_3px_rgba(139,47,224,0.8)] ring-1 ring-white/40 will-change-transform"
            style={{ transform: 'scaleY(0)' }}
          />
        </div>

        {/* Marcador: centrado en X sobre el track (left-1/2 + translate, no un offset a mano) */}
        <div
          ref={markerRef}
          className="absolute left-0 top-0 pointer-events-none will-change-transform"
          style={{ transform: 'translate3d(-50%, 0, 0) translateY(-50%)', left: '50%' }}
        >
          <div className="paw-wiggle w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#8B2FE0] flex items-center justify-center p-1 shadow-[0_0_14px_#8B2FE0] ring-2 ring-[#0D0A08]">
            <Image src={pawIcon} alt="" width={28} height={28} className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Strata Labels */}
      <div className="relative flex flex-col justify-between h-full pl-5 md:pl-7">
        {STRATA_LEVELS.map((level, levelIdx) => {
          const isActive = activeStrata === level.id;
          return (
            <button
              key={level.id}
              onClick={() => scrollToSection(level.id)}
              className={`text-left transition-all duration-300 group cursor-pointer flex items-start gap-1.5 ${
                isActive ? 'text-[#8B2FE0] font-bold scale-105' : 'text-white/50 hover:text-white'
              }`}
            >
              <span
                className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                  isActive ? 'bg-[#8B2FE0] shadow-[0_0_6px_2px_rgba(139,47,224,0.7)]' : 'bg-white/30'
                }`}
              />
              <span>
                <span className="uppercase tracking-wider text-[9px] md:text-[11px] font-bold leading-tight block">
                  <span className="hidden md:inline">{level.name}</span>
                  <span className="inline md:hidden">{level.code}</span>
                </span>
                {/* Cota: la del nivel activo es una lectura en vivo (se escribe por ref desde el
                    scroll, sin re-render) con cursor de terminal; las demás muestran su cota nominal. */}
                <span className="text-[9px] leading-[12px] h-3 w-[9ch] text-[#7ED957] font-semibold hidden md:block mt-0.5 tabular-nums whitespace-nowrap [contain:strict]">
                  <span
                    ref={(el) => {
                      depthRefs.current[levelIdx] = el;
                    }}
                  >
                    {level.depth}
                  </span>
                  {isActive && <span className="depth-caret" aria-hidden="true">▍</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
