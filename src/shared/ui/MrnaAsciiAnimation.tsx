'use client';
// Client: reproduce la secuencia ASCII a 24 fps escribiendo directo en el <pre> (sin
// re-render de React por fotograma) y solo mientras está visible. Los ~865 fotogramas ya
// no viajan dentro del bundle JS (eran ~18 MB): viven en /ascii/mrna-frames.txt y se
// descargan la primera vez que la animación entra en pantalla.
//
// La descarga y el trocado del archivo (~7 MB de texto) pasan en un Web Worker
// (public/ascii/frames-worker.js): partir ese texto en 865 fotogramas es trabajo
// síncrono, y hacerlo en el hilo principal aparecía en el perfil como el fotograma más
// lento de toda la página, justo cuando la tarjeta entraba en pantalla. El worker no
// materializa los 865 strings — solo calcula dónde empieza cada uno; el componente
// recorta el fotograma que toca en cada tick con `text.slice(...)`, que es barato.

import { useEffect, useRef, useState, type CSSProperties } from 'react';

const FPS = 24;
const FRAMES_URL = '/ascii/mrna-frames.txt';
const WORKER_URL = '/ascii/frames-worker.js';
const FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

interface FrameData {
  text: string;
  offsets: number[]; // offsets[i]..offsets[i+1]-1 es el fotograma i (el último llega hasta el final)
}

let framesPromise: Promise<FrameData> | null = null;
/** Una sola descarga por sesión, compartida entre todas las instancias. */
function loadFrames(): Promise<FrameData> {
  framesPromise ??= new Promise<FrameData>((resolve, reject) => {
    const worker = new Worker(WORKER_URL);
    worker.onmessage = (e: MessageEvent<{ ok: true; text: string; offsets: number[] } | { ok: false; error: string }>) => {
      worker.terminate();
      if (e.data.ok) resolve({ text: e.data.text, offsets: e.data.offsets });
      else reject(new Error(e.data.error));
    };
    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
    worker.postMessage({ url: FRAMES_URL });
  }).catch((err) => {
    framesPromise = null; // permite reintentar
    throw err;
  });
  return framesPromise;
}

function frameAt({ text, offsets }: FrameData, i: number): string {
  const start = offsets[i];
  const end = i + 1 < offsets.length ? offsets[i + 1] - 1 : text.length;
  return text.slice(start, end);
}

export interface MrnaAsciiAnimationProps {
  color?: string;
  fontSize?: number;
  scaleBoost?: number;
  isPaused?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function MrnaAsciiAnimation({
  color = '#C084FC',
  fontSize = 5,
  scaleBoost = 1,
  isPaused = false,
  className = '',
  style,
}: MrnaAsciiAnimationProps = {}) {
  const [frames, setFrames] = useState<FrameData | null>(null);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Visible en pantalla (con margen): dispara la descarga y decide si animar.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || frames) return;
    let cancelled = false;
    loadFrames()
      .then((f) => !cancelled && setFrames(f))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [visible, frames]);

  // Reproducción: escribe el texto directamente, sin pasar por el estado de React.
  useEffect(() => {
    const pre = preRef.current;
    if (!frames || !pre) return;
    if (!pre.textContent) pre.textContent = frameAt(frames, 0);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isPaused || !visible || reduceMotion) return;

    const frameCount = frames.offsets.length;
    let raf = 0;
    let last = 0;
    let index = 0;
    const step = 1000 / FPS;
    const tick = (time: number) => {
      if (!last) last = time;
      const delta = time - last;
      if (delta >= step) {
        index = (index + 1) % frameCount;
        pre.textContent = frameAt(frames, index);
        last = time - (delta % step);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frames, visible, isPaused]);

  // Escala tipo "contain": el arte se ve completo y centrado en ambos ejes.
  useEffect(() => {
    if (!frames) return;
    const measure = () => {
      const container = containerRef.current;
      const content = preRef.current;
      if (!container || !content) return;
      const w = content.scrollWidth;
      const h = content.scrollHeight;
      if (w <= 0 || h <= 0) return setScale(scaleBoost);
      const widthRatio = container.clientWidth / w;
      const heightRatio = container.clientHeight / h;
      const fit = heightRatio > 0 ? Math.min(widthRatio, heightRatio) : widthRatio;
      setScale((fit > 0 ? fit : 1) * scaleBoost);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [frames, fontSize, scaleBoost]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_FAMILY,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', flex: 'none' }}>
        <pre
          ref={preRef}
          aria-hidden="true"
          style={{ fontFamily: 'inherit', fontSize: `${fontSize}px`, lineHeight: 0.78, margin: 0, whiteSpace: 'pre', color }}
        />
      </div>
    </div>
  );
}
