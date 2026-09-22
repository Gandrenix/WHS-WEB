'use client';
// Client: texto del HUD con comportamiento de terminal. TypedLine escribe una línea con
// cursor; Live muestra una cifra que se "engancha" desde ruido y luego oscila como la
// lectura de un instrumento. El texto real se pinta por ref (ver terminal.ts).

import { useEffect, useRef, type CSSProperties } from 'react';
import { prefersReducedMotion, scrambleInto, typeInto } from './terminal';

/** Cursor de bloque de terminal: mismo ancho que un carácter monoespaciado. */
export function Caret() {
  return <span aria-hidden="true" className="hud-caret ml-[0.15em] inline-block h-[0.95em] w-[0.5em] translate-y-[0.12em] bg-current" />;
}

interface TypedLineProps {
  text: string;
  delay?: number;
  cps?: number;
  /** 'typing': el cursor solo aparece mientras escribe; 'always': se queda parpadeando al final. */
  caret?: 'typing' | 'always';
  className?: string;
  style?: CSSProperties;
}

export function TypedLine({ text, delay = 0, cps = 30, caret = 'typing', className = '', style }: TypedLineProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = textRef.current;
    const c = caretRef.current;
    if (!el || !c) return;
    if (prefersReducedMotion()) {
      el.textContent = text;
      c.style.display = 'none';
      return;
    }
    const showTimer = window.setTimeout(() => (c.style.display = 'inline-block'), delay);
    const cancel = typeInto(el, text, {
      delay,
      cps,
      onDone: () => {
        if (caret === 'typing') c.style.display = 'none';
      },
    });
    return () => {
      window.clearTimeout(showTimer);
      cancel();
    };
  }, [text, delay, cps, caret]);

  return (
    // El texto completo invisible reserva el ancho final: escribir no mueve el resto del bloque.
    <span className={`relative inline-block whitespace-pre ${className}`} style={style}>
      <span className="invisible">{text}</span>
      <span className="absolute left-0 top-0 whitespace-pre">
        <span ref={textRef} />
        <span ref={caretRef} style={{ display: 'none' }}>
          <Caret />
        </span>
      </span>
    </span>
  );
}

interface LiveProps {
  base: number;
  /** Cuánto puede alejarse la lectura de `base` (en las mismas unidades que el valor). */
  amp: number;
  decimals?: number;
  /** Relleno con ceros a la izquierda (ej. 4 para "0700"). */
  pad?: number;
  prefix?: string;
  suffix?: string;
  everyMs?: number;
  /** Retraso antes de que empiece a engancharse. */
  delay?: number;
  showCaret?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Live({
  base,
  amp,
  decimals = 0,
  pad = 0,
  prefix = '',
  suffix = '',
  everyMs = 1200,
  delay = 0,
  showCaret = false,
  className = '',
  style,
}: LiveProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (v: number) => `${prefix}${(decimals ? v.toFixed(decimals) : String(Math.round(v))).padStart(pad, '0')}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = fmt(base);
    if (prefersReducedMotion()) {
      el.style.opacity = '1';
      return;
    }
    let walk = 0;
    let value = base;
    const unit = 10 ** -decimals;
    const cancel = scrambleInto(el, fmt(base), {
      delay,
      onStart: () => (el.style.opacity = '1'),
      onDone: () => {
        walk = window.setInterval(() => {
          value = Math.min(base + amp, Math.max(base - amp, value + (Math.floor(Math.random() * 3) - 1) * unit));
          el.textContent = fmt(value);
        }, everyMs);
      },
    });
    return () => {
      cancel();
      window.clearInterval(walk);
    };
    // fmt depende solo de las props de formato, que no cambian durante la vida del nodo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, amp, decimals, pad, prefix, suffix, everyMs, delay]);

  return (
    <span className={`whitespace-pre tabular-nums ${className}`} style={style}>
      {/* opacity 0 hasta que arranca el enganche: evita que se vea la cifra final un instante antes del ruido */}
      <span ref={ref} style={{ opacity: 0 }} />
      {showCaret && <Caret />}
    </span>
  );
}
