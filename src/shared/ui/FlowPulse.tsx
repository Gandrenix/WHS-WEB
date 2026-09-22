// Pulso de luz que recorre una isolínea. El brillo es un segundo trazo más ancho y
// tenue debajo del trazo principal, NO un filter: drop-shadow sobre un SVG animado se
// recalcula entero en cada fotograma (stroke-dashoffset se anima en el hilo principal,
// no en el compositor), y con varias líneas por sección eso pesa de verdad.
// Ambos trazos comparten duración y desfase, así avanzan pegados. La animación vive en
// `.strata-pulse` (globals.css) y solo corre si el usuario acepta movimiento. En pantallas
// pequeñas el trazo de brillo se oculta (mitad de trazos animados en el hilo principal).

import type { CSSProperties } from 'react';

export interface FlowPulseProps {
  d: string;
  color?: string;
  width?: number;
  /** Segundos que tarda el pulso en dar la vuelta a la curva. */
  duration: number;
  /** Desfase en segundos (negativo = ya va a medio camino al cargar). */
  delay: number;
  /** Para SVG con preserveAspectRatio="none": mantiene el grosor en píxeles reales. */
  nonScaling?: boolean;
}

export function FlowPulse({ d, color = '#C084FC', width = 2.4, duration, delay, nonScaling = false }: FlowPulseProps) {
  const shared = {
    d,
    fill: 'none',
    strokeLinecap: 'round' as const,
        vectorEffect: nonScaling ? ('non-scaling-stroke' as const) : undefined,
    style: { '--dur': `${duration}s`, '--delay': `${delay}s` } as CSSProperties,
  };
  return (
    <>
      <path {...shared} className="strata-pulse strata-pulse-halo" stroke={color} strokeWidth={width * 3.4} strokeOpacity={0.2} />
      <path {...shared} className="strata-pulse" stroke={color} strokeWidth={width} />
    </>
  );
}
