// Ilustración vectorial del corte geológico del Hero. Está dibujada a mano (no es un
// trazado automático de la imagen) para que sea nítida a cualquier tamaño y para poder
// mover cada plano por separado.
//
// Arquitectura de capas (pensada para que el parallax vaya fluido):
// - Cada plano (A..D) es su PROPIO <svg> dentro de un contenedor `#wh-plane-x` que
//   HeroParallaxBackground mueve con transform. Antes los cuatro planos eran <g> de un
//   único SVG: mover un <g> obliga a repintar TODO el SVG en el hilo principal en cada
//   fotograma de scroll. Un <svg> con su propia capa de composición se rasteriza una vez y
//   el scroll solo lo desplaza en la GPU.
// - Los pulsos de luz (que sí repintan en cada fotograma, por stroke-dashoffset) van en
//   un <svg> aparte encima de cada plano, para no invalidar el dibujo estático de abajo.
// - Los textos del HUD ya no viven en el SVG: son HTML animable (ver hud/HeroHud.tsx).
//
// Geometría: todo se dimensiona con `--s`, los píxeles por unidad del viewBox (2000×1150),
// calculada con unidades de contenedor (ver HeroParallaxBackground). Es el mismo encuadre
// "slice" de antes: ancho centrado y anclado arriba, sin JS ni medidas en cliente.
//
// Tres decisiones de composición que no son obvias:
// 1. Con "slice" el recorte depende de la proporción del Hero. En el peor caso realista
//    (pantalla ancha y baja) solo se ven las columnas 0..2000 y las filas 0..850, y en una
//    ventana alta y angosta las columnas 180..1820. Por eso todo lo legible vive dentro de
//    ese cruce: columnas 180..1820, filas 0..840.
// 2. Todo el rango tonal (cielo → basamento) cabe en esas 840 filas; lo que queda
//    debajo es material extra que el parallax va revelando al bajar.
// 3. Cada plano se cierra a `planeHeight` = alto del viewBox + su recorrido de parallax:
//    cuando sube durante el scroll siempre hay relleno de sobra y nunca se ve un borde.

import type { ReactNode } from 'react';
import { FlowPulse } from '@/shared/ui/FlowPulse';
import { HudPlaneA, HudPlaneB, HudPlaneD } from './hud/HeroHud';

const VB_W = 2000;
const VB_H = 1150;

/** Recorrido de cada plano en unidades del viewBox. Deben ir de mayor a menor: si un plano
 *  profundo subiera más que el de arriba, los estratos se cruzarían. */
export const PLANE_TRAVEL = { a: 1150, b: 740, c: 400, d: 140 } as const;
export type PlaneKey = keyof typeof PLANE_TRAVEL;

/** Alto de cada plano: lo que se ve (viewBox) + lo que sube + un margen. */
const planeHeight = (k: PlaneKey) => VB_H + PLANE_TRAVEL[k] + 40;

const PURPLE = '#8B2FE0';
const PURPLE_SOFT = '#A78BFA';
const INK = '#1A1720';
const PAPER = '#F2EDE4';

/** Contornos de cada estrato, de la superficie hacia el fondo. */
const C1 = 'M0,380 C112,374 220,399 320,434 C420,471 505,497 620,508 C740,518 865,506 988,510 C1115,508 1242,486 1362,466 C1482,444 1615,428 1740,430 C1848,432 1935,434 2000,435';
const C2 = 'M0,418 C112,412 220,436 320,469 C420,505 505,529 620,540 C740,550 865,538 988,542 C1115,540 1242,519 1362,500 C1482,479 1615,464 1740,466 C1848,468 1935,469 2000,470';
const C3 = 'M0,456 C112,450 220,473 320,505 C420,538 505,561 620,571 C740,581 865,569 988,573 C1115,571 1242,551 1362,533 C1482,514 1615,499 1740,501 C1848,503 1935,505 2000,506';
const C4 = 'M0,494 C112,488 220,510 320,540 C420,572 505,594 620,603 C740,613 865,601 988,605 C1115,603 1242,584 1362,567 C1482,549 1615,535 1740,537 C1848,539 1935,540 2000,541';
const C5 = 'M0,532 C112,526 220,547 320,575 C420,605 505,625 620,634 C740,644 865,632 988,636 C1115,634 1242,617 1362,601 C1482,584 1615,570 1740,572 C1848,574 1935,575 2000,576';
const C6 = 'M0,572 C112,566 220,586 320,613 C420,641 505,660 620,668 C740,678 865,666 988,670 C1115,668 1242,652 1362,637 C1482,621 1615,608 1740,610 C1848,612 1935,612 2000,613';
const C7 = 'M0,612 C112,606 220,625 320,650 C420,676 505,694 620,702 C740,712 865,699 988,703 C1115,701 1242,686 1362,672 C1482,657 1615,645 1740,647 C1848,649 1935,650 2000,651';
const C8 = 'M0,654 C112,648 220,666 320,689 C420,713 505,730 620,737 C740,747 865,734 988,738 C1115,736 1242,723 1362,710 C1482,696 1615,685 1740,687 C1848,689 1935,689 2000,690';
const C9 = 'M0,696 C112,690 220,707 320,728 C420,751 505,766 620,773 C740,783 865,770 988,774 C1115,772 1242,760 1362,748 C1482,735 1615,724 1740,726 C1848,728 1935,728 2000,729';
const C10 = 'M0,738 C112,732 220,749 320,768 C420,788 505,802 620,808 C740,818 865,806 988,810 C1115,808 1242,796 1362,785 C1482,774 1615,764 1740,766 C1848,768 1935,767 2000,768';
const C11 = 'M0,782 C112,776 220,791 320,809 C420,828 505,840 620,846 C740,856 865,843 988,847 C1115,845 1242,835 1362,825 C1482,814 1615,805 1740,807 C1848,809 1935,809 2000,810';

interface StratumProps {
  d: string;
  fill: string;
  floor: number;
  lineOpacity?: number;
}

/** Un estrato = relleno cerrado en el fondo del plano + su isolínea púrpura. */
function Stratum({ d, fill, floor, lineOpacity = 0.75 }: StratumProps) {
  return (
    <>
      <path d={`${d} L${VB_W},${floor} L0,${floor} Z`} fill={fill} />
      <path d={d} fill="none" stroke={PURPLE} strokeWidth="2" strokeOpacity={lineOpacity} />
    </>
  );
}

function Crosshair({ x, y, size = 16, opacity = 0.5 }: { x: number; y: number; size?: number; opacity?: number }) {
  return (
    <path
      d={`M${x - size},${y} h${size * 2} M${x},${y - size} v${size * 2}`}
      stroke={PURPLE}
      strokeOpacity={opacity}
      strokeWidth="1.8"
      fill="none"
    />
  );
}

function Shrub({ id }: { id: string }) {
  return (
    <g id={id}>
      <path d="M0,0 V-12" stroke="#3E3746" strokeWidth="2" strokeLinecap="round" />
      <circle cx="0" cy="-16" r="5.6" fill="#3E3746" />
      <circle cx="-6" cy="-11" r="4.4" fill="#3E3746" />
      <circle cx="6.2" cy="-11.4" r="4.2" fill="#3E3746" />
      <circle cx="-2.6" cy="-21.4" r="3.8" fill="#3E3746" />
      <circle cx="3.6" cy="-20" r="3.2" fill="#3E3746" />
    </g>
  );
}

/** <svg> de un plano: mismo sistema de coordenadas del viewBox original, más alto. */
function PlaneSvg({ k, children, className = '' }: { k: PlaneKey; children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${planeHeight(k)}`}
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/**
 * Pulsos de luz que recorren las isolíneas de un plano. Cada pulso lleva su propia
 * duración y desfase para que no avancen sincronizados. Capa aparte y propia: sus
 * repintados por fotograma no tocan el dibujo estático del plano.
 */
function PulseLayer({ k, contours, color = '#C084FC', width = 2.6 }: { k: PlaneKey; contours: ReadonlyArray<string>; color?: string; width?: number }) {
  return (
    <PlaneSvg k={k} className="will-change-transform">
      {contours.map((d, i) => (
        <FlowPulse key={i} d={d} color={color} width={width} duration={15 + i * 3.5} delay={-i * 5.5} />
      ))}
    </PlaneSvg>
  );
}

/** Contenedor de un plano: es lo que GSAP desplaza. Se posiciona con --s, sin JS. */
function Plane({ k, children }: { k: PlaneKey; children: ReactNode }) {
  return (
    <div
      id={`wh-plane-${k}`}
      className="wh-plane absolute top-0 will-change-transform"
      style={{
        left: `calc(50% - var(--s) * ${VB_W / 2})`,
        width: `calc(var(--s) * ${VB_W})`,
        height: `calc(var(--s) * ${planeHeight(k)})`,
      }}
    >
      {children}
    </div>
  );
}

/** Cielo de papel con grano: estático, no participa del parallax. */
function Sky() {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMin slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="wh-grain-light" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="1.3" fill={INK} fillOpacity="0.13" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={VB_W} height={VB_H} fill={PAPER} />
      <rect x="0" y="0" width={VB_W} height="600" fill="url(#wh-grain-light)" />
    </svg>
  );
}

export function StrataScene() {
  const fa = planeHeight('a');
  const fb = planeHeight('b');
  const fc = planeHeight('c');
  const fd = planeHeight('d');

  return (
    <>
      <Sky />

      {/* ---------- PLANO A · superficie (el que más corre) ---------- */}
      <Plane k="a">
        <PlaneSvg k="a">
          <defs>
            <Shrub id="wh-shrub-a" />
          </defs>

          <circle cx="210" cy="70" r="7" fill="none" stroke={PURPLE} strokeWidth="2" />
          {/* Ficha técnica: la línea vertical (el texto es HTML, ver HudPlaneA) */}
          <path d="M1820,70 V248" stroke={INK} strokeWidth="2" strokeOpacity="0.45" fill="none" />

          <Crosshair x={1470} y={188} size={15} />

          <Stratum d={C1} fill="#EDE7DB" floor={fa} lineOpacity={0.5} />
          <Stratum d={C2} fill="#E4DCD1" floor={fa} lineOpacity={0.55} />

          {/* Vegetación sobre las primeras crestas */}
          <g opacity="0.5">
            <use href="#wh-shrub-a" transform="translate(238,408) scale(1.05)" />
            <use href="#wh-shrub-a" transform="translate(292,422) scale(0.8)" />
            <use href="#wh-shrub-a" transform="translate(352,442) scale(0.95)" />
            <use href="#wh-shrub-a" transform="translate(1594,466) scale(1)" />
            <use href="#wh-shrub-a" transform="translate(1652,464) scale(0.78)" />
            <use href="#wh-shrub-a" transform="translate(1792,466) scale(0.9)" />
          </g>

          {/* Estación topográfica sobre la cresta derecha */}
          <g stroke={PURPLE} strokeWidth="2.2" fill="none" strokeLinecap="round">
            <path d="M1665,384 h30 v20 h-30 z" />
            <path d="M1680,366 v18" />
            <path d="M1680,404 l-20,38 M1680,404 l20,38 M1680,404 v38" />
          </g>
        </PlaneSvg>
        <PulseLayer k="a" contours={[C1, C2]} color={PURPLE} />
        <HudPlaneA />
      </Plane>

      {/* ---------- PLANO B · estratos medios ---------- */}
      <Plane k="b">
        <PlaneSvg k="b">
          <defs>
            <Shrub id="wh-shrub-b" />
          </defs>
          <Stratum d={C3} fill="#D9D0CC" floor={fb} lineOpacity={0.6} />
          <Stratum d={C4} fill="#C8BEC6" floor={fb} lineOpacity={0.65} />
          <Stratum d={C5} fill="#B0A6B4" floor={fb} lineOpacity={0.7} />

          {/* Cota -120 m (la lectura es HTML, ver HudPlaneB) */}
          <g stroke={PURPLE} strokeWidth="2.2" fill="none">
            <path d="M1440,520 V622" />
            <circle cx="1440" cy="520" r="5" fill={PURPLE} />
            <circle cx="1440" cy="630" r="9" />
            <circle cx="1440" cy="630" r="3" fill={PURPLE} stroke="none" />
          </g>

          <g opacity="0.4">
            <use href="#wh-shrub-b" transform="translate(520,528) scale(0.72)" />
            <use href="#wh-shrub-b" transform="translate(1290,552) scale(0.68)" />
          </g>
        </PlaneSvg>
        <PulseLayer k="b" contours={[C3, C4, C5]} color={PURPLE} />
        <HudPlaneB />
      </Plane>

      {/* ---------- PLANO C · estratos profundos ---------- */}
      <Plane k="c">
        <PlaneSvg k="c">
          <Stratum d={C6} fill="#918799" floor={fc} lineOpacity={0.75} />
          <Stratum d={C7} fill="#6E6579" floor={fc} lineOpacity={0.8} />
          <Stratum d={C8} fill="#4C455A" floor={fc} lineOpacity={0.8} />

          {/* Bloques de roca en el fondo del valle */}
          <g fill="#8D8496" fillOpacity="0.85">
            <path d="M852,694 l20,-15 24,5 8,16 -25,11 -22,-4 z" />
            <path d="M904,688 l17,-12 21,5 5,14 -21,10 -19,-4 z" />
            <path d="M952,696 l15,-11 19,5 5,13 -19,8 -17,-3 z" />
            <path d="M994,704 l12,-9 16,4 4,11 -16,7 -14,-3 z" />
            <path d="M1028,710 l10,-7 13,3 3,9 -13,6 -12,-2 z" />
          </g>
        </PlaneSvg>
        <PulseLayer k="c" contours={[C6, C7, C8]} color="#B48CF5" />
      </Plane>

      {/* ---------- PLANO D · basamento (el que menos corre) ---------- */}
      <Plane k="d">
        <PlaneSvg k="d">
          <defs>
            <pattern id="wh-grain-dark" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.1" fill="#FFFFFF" fillOpacity="0.12" />
            </pattern>
            <clipPath id="wh-abyss-clip">
              <path d={`${C11} L${VB_W},${fd} L0,${fd} Z`} />
            </clipPath>
          </defs>

          {/* La rampa termina en #24202F, el mismo color con que arranca el Manifiesto: el
              abismo del Hero ya no es lo más oscuro de la página (eso pasaba antes, y las
              secciones de abajo quedaban MÁS claras que el fondo del Hero). */}
          <Stratum d={C9} fill="#3B3649" floor={fd} lineOpacity={0.85} />
          <Stratum d={C10} fill="#302C3E" floor={fd} lineOpacity={0.85} />
          <path d={`${C11} L${VB_W},${fd} L0,${fd} Z`} fill="#24202F" />
          <path d={C11} fill="none" stroke={PURPLE} strokeWidth="2" strokeOpacity="0.8" />

          <g clipPath="url(#wh-abyss-clip)">
            <rect x="0" y="782" width={VB_W} height={fd - 782} fill="url(#wh-grain-dark)" />
          </g>

          {/* Isolíneas sueltas en el basamento */}
          <g fill="none" stroke={PURPLE} strokeWidth="2" strokeOpacity="0.5">
            <path d="M0,884 C130,876 270,894 420,912 C570,930 720,938 880,932 C1060,926 1240,906 1420,899 C1600,892 1820,898 2000,905" />
            <path d="M0,968 C140,960 280,976 430,993 C580,1010 730,1017 890,1011 C1070,1005 1250,987 1430,980 C1610,973 1825,979 2000,986" />
            <path d="M0,1054 C150,1046 290,1061 440,1076 C590,1091 740,1098 900,1093 C1080,1087 1260,1070 1440,1064 C1620,1058 1830,1063 2000,1070" />
          </g>

          {/* Marcador de muestra (los textos son HTML, ver HudPlaneD) */}
          <g stroke={PURPLE_SOFT} strokeWidth="2.2" fill="none">
            <path d="M520,702 V768" />
            <circle cx="520" cy="702" r="5" fill={PURPLE_SOFT} />
            <circle cx="520" cy="776" r="9" />
            <circle cx="520" cy="776" r="3" fill={PURPLE_SOFT} stroke="none" />
          </g>
        </PlaneSvg>
        <PulseLayer k="d" contours={[C9, C10, C11]} />
        <HudPlaneD />
      </Plane>
    </>
  );
}
