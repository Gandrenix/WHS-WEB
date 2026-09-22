'use client';
// Client: capa de texto del HUD cartográfico del Hero. Antes eran <text> dentro del SVG,
// lo que (1) los hacía imposibles de animar sin repintar toda la ilustración y (2) los
// dejaba estáticos. Ahora son HTML sobre una capa propia, con la misma geometría que el
// SVG: todo se posiciona en "unidades del viewBox" (2000 de ancho) multiplicadas por --s
// (ver HeroParallaxBackground), así encaja exactamente con el dibujo.
//
// Comportamiento de terminal: las coordenadas se "enganchan" desde ruido y luego oscilan
// como un GPS; la ficha técnica escribe un log de escaneo que recorre las 4 capas del
// mapa; las cotas leen en vivo y los marcadores emiten un ping de sonar.

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Live, TypedLine } from './HudText';
import { prefersReducedMotion } from './terminal';

const PURPLE = '#8B2FE0';
const PURPLE_SOFT = '#A78BFA';
const INK = '#1A1720';
const MUTED = '#5A5560';
const ON_DARK = '#E8E4DC';
const FIX_GREEN = '#3A7D2C';

const u = (n: number) => `calc(var(--s) * ${n})`;

function Abs({
  x,
  y,
  right,
  size,
  lh,
  color,
  children,
  style,
}: {
  x?: number;
  y: number;
  right?: number;
  size: number;
  lh: number;
  color: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className="absolute whitespace-pre font-mono"
      style={{
        left: x === undefined ? undefined : u(x),
        right: right === undefined ? undefined : u(right),
        top: u(y),
        fontSize: u(size),
        lineHeight: u(lh),
        letterSpacing: '0.07em',
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Capa contenedora: ocupa el plano completo y vive en su propia capa de composición. */
function HudLayer({ children }: { children: ReactNode }) {
  return (
    <div className="hud-layer absolute inset-0 will-change-transform [contain:layout_style]" aria-hidden="true">
      {children}
    </div>
  );
}

const LAYER_NAMES = ['HUMUS', 'ARCILLA', 'CALIZA', 'BASAMENTO'] as const;

/** Plano A · coordenadas, ficha técnica con log de escaneo y mapa de capas. */
export function HudPlaneA() {
  const [layer, setLayer] = useState(0);
  const [cycled, setCycled] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      setCycled(true);
      setLayer((l) => (l + 1) % LAYER_NAMES.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <HudLayer>
      {/* Coordenadas: se enganchan desde ruido y luego oscilan como un GPS */}
      <Abs x={238} y={44} size={20} lh={34} color={PURPLE}>
        <div>
          04° 46&apos; <Live base={32} amp={2} pad={2} everyMs={1700} delay={200} />&quot; N
        </div>
        <div>
          74° 04&apos; <Live base={12} amp={2} pad={2} everyMs={2100} delay={450} />&quot; W
        </div>
      </Abs>
      <Abs x={238} y={112} size={14} lh={22} color={FIX_GREEN}>
        <TypedLine text="● FIX 3D · ±0.4 m" delay={1500} cps={38} />
      </Abs>

      {/* Ficha técnica, alineada a la derecha, con el log de escaneo al final */}
      <Abs right={220} y={112} size={20} lh={32} color={MUTED} style={{ textAlign: 'right' }}>
        <div style={{ color: INK, fontWeight: 700 }}>
          <TypedLine text="GEOLOGICAL SECTION" delay={300} cps={34} />
        </div>
        <div>
          lat 04.
          <Live base={1756} amp={5} pad={4} everyMs={900} delay={700} />
        </div>
        <div>
          lon 74.
          <Live base={700} amp={5} pad={4} everyMs={1100} delay={950} />
        </div>
        <div>
          <TypedLine text="scale 1:5000" delay={1200} cps={30} />
        </div>
        <div style={{ color: PURPLE }}>
          <TypedLine
            text={`> scan 0${layer + 1}/04`}
            delay={cycled ? 0 : 2300}
            cps={34}
            caret="always"
          />
        </div>
      </Abs>

      {/* Rosa de los vientos: aguja con oscilación y un barrido de radar detrás */}
      <div className="absolute" style={{ left: u(228), top: u(208), width: u(88), height: u(88) }}>
        <div className="hud-sweep absolute inset-0 rounded-full" />
        <svg viewBox="0 0 88 88" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
          <circle cx="44" cy="44" r="43" stroke={PURPLE} strokeWidth="2.2" />
          <g className="hud-needle">
            <g transform="translate(-228,-208)">
              <path d="M272 203 Q276 238 321 252 Q276 266 272 301 Q268 266 223 252 Q268 238 272 203 Z" fill={PURPLE} />
            </g>
          </g>
        </svg>
      </div>

      {/* Título del mapa + indicador de capas sincronizado con el log */}
      <Abs x={204} y={320} size={20} lh={30} color={INK}>
        <div style={{ fontWeight: 700 }}>
          <TypedLine text="STRATA MAP" delay={900} cps={26} />
        </div>
        <div className="flex items-center" style={{ gap: u(7), opacity: 0.75 }}>
          <span>/ LAYERS</span>
          <span className="flex" style={{ gap: u(4) }}>
            {LAYER_NAMES.map((n, i) => (
              <span
                key={n}
                style={{
                  width: u(10),
                  height: u(16),
                  background: i === layer ? PURPLE : 'transparent',
                  border: `${u(1.6)} solid ${PURPLE}`,
                  opacity: i === layer ? 1 : 0.45,
                  transition: 'background-color 200ms, opacity 200ms',
                }}
              />
            ))}
          </span>
        </div>
      </Abs>
    </HudLayer>
  );
}

/** Anillo que se expande y se desvanece: el "ping" de un sonar. Solo transform + opacity. */
function Ping({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <span
      className="hud-ping absolute rounded-full"
      style={{ left: u(x - 9), top: u(y - 9), width: u(18), height: u(18), border: `${u(2)} solid ${color}` }}
    />
  );
}

/** Plano B · cota -120 m con lectura en vivo. */
export function HudPlaneB() {
  return (
    <HudLayer>
      <Ping x={1440} y={630} color={PURPLE} />
      <Abs x={1466} y={506} size={25} lh={34} color={PURPLE}>
        <Live base={120} amp={0.3} decimals={1} prefix="-" suffix=" m" everyMs={1300} delay={1800} showCaret />
      </Abs>
    </HudLayer>
  );
}

/** Plano D · marcador de muestra STRATA I. */
export function HudPlaneD() {
  return (
    <HudLayer>
      <Ping x={520} y={776} color={PURPLE_SOFT} />
      <Abs x={546} y={690} size={24} lh={34} color={ON_DARK}>
        <div>
          <TypedLine text="STRATA I" delay={2000} cps={22} />
        </div>
        <div style={{ color: PURPLE_SOFT }}>
          <Live base={120} amp={0.3} decimals={1} prefix="-" suffix=" m" everyMs={1500} delay={2500} showCaret />
        </div>
      </Abs>
    </HudLayer>
  );
}
