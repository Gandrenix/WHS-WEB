'use client';
// Client: fondo del Hero con parallax por capas vía GSAP/ScrollTrigger. Cada plano
// del SVG (superficie → basamento) sube a distinta velocidad: la superficie pasa
// rápido y el basamento casi no se mueve, así el scroll se siente como descender.

import { useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { DriftingClouds, type Cloud } from '@/shared/ui/DriftingClouds';
import { usePauseWhenOffscreen } from '@/shared/hooks/usePauseWhenOffscreen';
import { StrataScene, PLANE_TRAVEL, type PlaneKey } from './StrataScene';

gsap.registerPlugin(ScrollTrigger);

/** Planos que se desplazan (ver StrataScene): el recorrido sale de PLANE_TRAVEL, en unidades del viewBox. */
const PLANES = Object.keys(PLANE_TRAVEL) as PlaneKey[];

/**
 * Nubes del cielo del Hero, solo en el tercio superior (el cielo). Sprites "day": blanco
 * con sombra lavanda, que sobre el crema se leen por su volumen. Las de arriba son más
 * grandes y lentas (más lejanas).
 */
const SKY_CLOUDS: ReadonlyArray<Cloud> = [
  { sprite: 'bank-day', top: '2%', width: 1100, duration: 200, delay: -40, opacity: 0.75, x0: '8vw' },
  { sprite: 'cumulus-day', top: '14%', width: 520, duration: 150, delay: -95, opacity: 0.9, x0: '52vw', flip: true },
  { sprite: 'wisp-day', top: '24%', width: 900, duration: 170, delay: -20, opacity: 0.7, x0: '30vw' },
  { sprite: 'puff-day', top: '8%', width: 300, duration: 115, delay: -70, opacity: 0.9, x0: '78vw' },
];

export function HeroParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  usePauseWhenOffscreen(containerRef);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const container = containerRef.current;
      if (!container) return;

      // El recorrido está en unidades del viewBox; cada plano mide 2000 unidades de ancho,
      // así que píxeles por unidad = ancho del plano / 2000. Se recalcula en cada refresh
      // (resize) porque --s depende del tamaño del Hero.
      PLANES.forEach((key) => {
        const plane = container.querySelector<HTMLElement>(`#wh-plane-${key}`);
        if (!plane) return;
        gsap.fromTo(
          plane,
          { y: 0 },
          {
            y: () => -PLANE_TRAVEL[key] * (plane.offsetWidth / 2000),
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: container,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      data-inview="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      // --s = píxeles por unidad del viewBox 2000×1150 con encuadre "slice" (cubrir): el
      // mayor de los dos factores. container-type permite usar cqw/cqh sin medir en JS.
      style={{ containerType: 'size', '--s': 'max(calc(100cqw / 2000), calc(100cqh / 1150))' } as CSSProperties}
    >
      <StrataScene />
      <DriftingClouds clouds={SKY_CLOUDS} />
      {/* Velo suave tras el título: baja el contraste de las isolíneas justo donde
          cae el texto, sin apagar la ilustración de los costados. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_46%_at_50%_30%,rgba(242,237,228,0.78)_0%,rgba(242,237,228,0.3)_60%,transparent_100%)]" />
      {/* Fundido hacia el color de arranque del Manifiesto (#24202F): el Hero ya no
          termina en crema, así el descenso sigue sin corte hacia la sección de abajo. */}
      <div className="absolute inset-x-0 bottom-0 h-[14%] bg-gradient-to-b from-transparent to-[#24202F]" />
    </div>
  );
}
