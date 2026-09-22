// Nubes que derivan horizontalmente. Cada nube es un sprite WebP prerenderizado con
// `scripts/generate-clouds.mjs` (ruido fractal + luz desde abajo, paleta de la marca) y
// solo se mueve con `transform`, que va por el compositor: cero repintado por fotograma.
// Se cargan `lazy` y sin optimizador de Next (ya están optimizadas y son estáticas).
//
// La animación (`.strata-cloud` en globals.css) solo corre si el usuario acepta
// movimiento; si no, cada nube queda quieta en su posición inicial `x0`.

import Image, { type StaticImageData } from 'next/image';
import type { CSSProperties } from 'react';
import bankDay from '@/shared/assets/clouds/bank-day.webp';
import bankDusk from '@/shared/assets/clouds/bank-dusk.webp';
import cumulusDay from '@/shared/assets/clouds/cumulus-day.webp';
import cumulusDusk from '@/shared/assets/clouds/cumulus-dusk.webp';
import puffDay from '@/shared/assets/clouds/puff-day.webp';
import puffDusk from '@/shared/assets/clouds/puff-dusk.webp';
import wispDay from '@/shared/assets/clouds/wisp-day.webp';
import wispDusk from '@/shared/assets/clouds/wisp-dusk.webp';

const SPRITES = {
  'bank-day': bankDay,
  'bank-dusk': bankDusk,
  'cumulus-day': cumulusDay,
  'cumulus-dusk': cumulusDusk,
  'puff-day': puffDay,
  'puff-dusk': puffDusk,
  'wisp-day': wispDay,
  'wisp-dusk': wispDusk,
} satisfies Record<string, StaticImageData>;

export type CloudSprite = keyof typeof SPRITES;

export interface Cloud {
  /** Qué sprite usar: la forma (bank/cumulus/puff/wisp) y su paleta (day sobre fondo claro, dusk sobre oscuro). */
  sprite: CloudSprite;
  /** Posición vertical dentro del contenedor, ej. '18%'. */
  top: string;
  /** Ancho en px; el alto sale de la proporción del sprite. */
  width: number;
  /** Segundos que tarda en cruzar la pantalla. */
  duration: number;
  /** Desfase inicial en segundos (negativo = ya va a mitad de camino al cargar). */
  delay: number;
  opacity: number;
  /** Posición horizontal estática (sin movimiento), ej. '30vw'. */
  x0: string;
  /** Espeja el sprite para que la misma forma no se repita idéntica. */
  flip?: boolean;
}

export function DriftingClouds({ clouds, className = '' }: { clouds: ReadonlyArray<Cloud>; className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {clouds.map((c, i) => {
        const img = SPRITES[c.sprite];
        return (
          <div
            key={i}
            className="strata-cloud absolute left-0 will-change-transform"
            style={
              {
                top: c.top,
                // en pantallas angostas la nube se encoge con el viewport (nunca más de ~1.1 veces su ancho en vw)
                width: `min(${c.width}px, ${((c.width / 900) * 100).toFixed(1)}vw)`,
                opacity: c.opacity,
                transform: `translateX(${c.x0})`,
                '--dur': `${c.duration}s`,
                '--delay': `${c.delay}s`,
              } as CSSProperties
            }
          >
            <Image
              src={img}
              alt=""
              unoptimized
              loading="lazy"
              fetchPriority="low"
              draggable={false}
              className="block h-auto w-full select-none"
              style={c.flip ? { transform: 'scaleX(-1)' } : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
