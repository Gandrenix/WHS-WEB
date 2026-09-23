'use client';
// Client: visor a pantalla completa con zoom (rueda, botones, doble clic) y arrastre para
// moverse por la imagen ampliada. Vive en un portal para no quedar recortado por el
// overflow de las tarjetas del formulario. Esc o clic fuera lo cierran.
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const STEP = 1.4;

export interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // Forma funcional: los listeners (teclado, rueda) siempre ven el zoom actual.
  const zoomBy = useCallback((factor: number) => {
    setScale((s) => {
      const next = clamp(s * factor, MIN_SCALE, MAX_SCALE);
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === '+' || e.key === '=') zoomBy(STEP);
      else if (e.key === '-') zoomBy(1 / STEP);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, zoomBy]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (scale === MIN_SCALE) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    setOffset({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y });
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const toolBtn =
    'flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${alt}`}
      className="fixed inset-0 z-[300] flex flex-col bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onWheel={(e) => zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15)}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <span className="truncate font-mono text-xs text-white/60">{alt}</span>
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/50 p-1">
          <button type="button" className={toolBtn} onClick={() => zoomBy(1 / STEP)} disabled={scale <= MIN_SCALE} aria-label="Alejar">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-mono text-xs text-white/80" aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <button type="button" className={toolBtn} onClick={() => zoomBy(STEP)} disabled={scale >= MAX_SCALE} aria-label="Acercar">
            <Plus className="h-4 w-4" />
          </button>
          <button type="button" className={toolBtn} onClick={reset} disabled={scale === 1} aria-label="Restablecer zoom">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button type="button" className={toolBtn} onClick={onClose} aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- URL arbitraria del admin, sin dominio conocido para next/image */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={() => (scale > 1 ? reset() : zoomBy(2.5))}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="max-h-full max-w-full select-none object-contain"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transition: dragging ? 'none' : 'transform 120ms ease-out',
            cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
            touchAction: 'none',
          }}
        />
      </div>

      <p className="shrink-0 pb-3 text-center font-mono text-[10px] text-white/40" onClick={(e) => e.stopPropagation()}>
        Rueda o +/− para hacer zoom · doble clic para ampliar · arrastra para moverte · Esc para cerrar
      </p>
    </div>,
    document.body
  );
}
