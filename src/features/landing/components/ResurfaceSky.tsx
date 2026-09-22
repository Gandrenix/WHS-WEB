'use client';
// Client: transición Bedrock → footer. Es el Hero al revés: en vez de descender de la
// luz al negro, aquí se emerge del negro (#0D0A08, el color exacto de Bedrock) hacia el
// crema del footer, con las últimas isolíneas (con su flujo de luz) hundiéndose abajo y
// nubes que derivan por delante. El contraste blanco/negro no es un corte: es una rampa
// suave con un halo de horizonte, para que se sienta como amanecer y no como una pared.

import { useRef } from 'react';
import { DriftingClouds, type Cloud } from '@/shared/ui/DriftingClouds';
import { FlowPulse } from '@/shared/ui/FlowPulse';
import { wavePath } from '@/shared/lib/wave';
import { usePauseWhenOffscreen } from '@/shared/hooks/usePauseWhenOffscreen';

const VB_W = 1440;
const VB_H = 460;

/** Rampa de emersión: mismas paradas que un amanecer, con la luminancia repartida en parejo. */
const SKY_GRADIENT =
  'linear-gradient(180deg, #0D0A08 0%, #191424 10%, #302B44 24%, #5C5470 38%, #9C92AC 52%, #CFC6D2 68%, #E9E2DD 82%, #F2EDE4 96%)';

/** Las isolíneas solo viven en el tramo oscuro y se desvanecen antes de llegar a la luz. */
const LINES_FADE = 'linear-gradient(to bottom, #000 0%, #000 22%, transparent 62%)';

/** [baseY, amplitud, fase] — de arriba (más marcada) hacia abajo (más lejana). */
const LINES: ReadonlyArray<readonly [number, number, number]> = [
  [34, 14, 0.9],
  [78, 18, 2.3],
  [126, 20, 3.7],
  [180, 22, 5.1],
];

/**
 * Nubes por capas de profundidad, repartidas por TODA la altura del cielo. Arriba, sobre
 * el violeta oscuro, van los sprites "dusk" (vientre lila que recibe la luz del amanecer);
 * abajo, sobre el crema, los "day" (blanco con sombra lavanda). Las lejanas (arriba)
 * son más tenues, pequeñas y lentas; las cercanas (abajo), grandes, opacas y más rápidas.
 */
const CLOUDS: ReadonlyArray<Cloud> = [
  { sprite: 'wisp-dusk', top: '6%', width: 900, duration: 260, delay: -70, opacity: 0.55, x0: '6vw' },
  { sprite: 'wisp-dusk', top: '19%', width: 760, duration: 230, delay: -170, opacity: 0.6, x0: '58vw', flip: true },
  { sprite: 'bank-dusk', top: '14%', width: 1100, duration: 210, delay: -40, opacity: 0.5, x0: '30vw' },
  { sprite: 'cumulus-dusk', top: '30%', width: 540, duration: 180, delay: -120, opacity: 0.85, x0: '70vw', flip: true },
  { sprite: 'wisp-day', top: '43%', width: 1000, duration: 150, delay: -90, opacity: 0.85, x0: '35vw' },
  { sprite: 'bank-day', top: '40%', width: 1200, duration: 135, delay: -60, opacity: 0.95, x0: '0vw' },
  { sprite: 'cumulus-day', top: '46%', width: 480, duration: 120, delay: -25, opacity: 0.95, x0: '62vw', flip: true },
  { sprite: 'puff-day', top: '68%', width: 320, duration: 100, delay: -55, opacity: 0.95, x0: '20vw' },
  { sprite: 'bank-day', top: '54%', width: 900, duration: 110, delay: -80, opacity: 0.9, x0: '72vw', flip: true },
];

export function ResurfaceSky() {
  const rootRef = useRef<HTMLDivElement>(null);
  usePauseWhenOffscreen(rootRef);

  return (
    <div ref={rootRef} data-inview="true" className="relative -mt-px h-[460px] overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: SKY_GRADIENT }} />

      {/* Halo de horizonte: la luz que viene de arriba del suelo, sin ningún color de marca */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_42%_at_50%_100%,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0)_70%)]" />

      {/* Últimas isolíneas, con el mismo flujo de luz que el resto de la página */}
      <div className="absolute inset-0" style={{ maskImage: LINES_FADE, WebkitMaskImage: LINES_FADE }}>
        <svg className="h-full w-full" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
          {LINES.map(([y, amp, phase], i) => (
            <path
              key={i}
              d={wavePath(y, amp, phase, VB_W)}
              fill="none"
              stroke="#8B2FE0"
              strokeOpacity={0.5 - i * 0.07}
              strokeWidth="1.8"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {LINES.map(([y, amp, phase], i) => (
            <FlowPulse key={i} d={wavePath(y, amp, phase, VB_W)} duration={14 + i * 3} delay={-i * 4.5} nonScaling />
          ))}
        </svg>
      </div>

      <DriftingClouds clouds={CLOUDS} />
    </div>
  );
}
