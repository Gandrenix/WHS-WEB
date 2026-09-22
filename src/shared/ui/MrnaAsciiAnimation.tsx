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

/** Ahorro de datos: Chrome/Android expone esto, Safari/iOS no — ahí simplemente no aplica. */
function prefersSavingData(): boolean {
  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!conn) return false;
  return Boolean(conn.saveData) || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
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
  const [renderFontSize, setRenderFontSize] = useState(fontSize);
  // Distingue "todavía no entra en pantalla" de "entró y sigue bajando el archivo" (~880 KB
  // comprimidos): sin esto, en una conexión lenta la tarjeta se veía en blanco un buen
  // rato y parecía rota en vez de estar cargando.
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'saveData'>('idle');
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

  const loadStartedRef = useRef(false);
  useEffect(() => {
    if (!visible || frames || loadStartedRef.current) return;
    if (prefersSavingData()) {
      setStatus('saveData');
      return;
    }
    loadStartedRef.current = true;
    let cancelled = false;
    setStatus('loading');
    loadFrames()
      .then((f) => {
        if (cancelled) return;
        (window as unknown as { __setFramesCalled?: number }).__setFramesCalled =
          ((window as unknown as { __setFramesCalled?: number }).__setFramesCalled ?? 0) + 1;
        setFrames(f);
        setStatus('idle');
      })
      .catch(() => {
        if (cancelled) return;
        loadStartedRef.current = false; // permite reintentar si vuelve a entrar en pantalla
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [visible, frames]);

  // Escribe el primer fotograma, mide el tamaño y arranca la animación — las tres cosas en
  // un solo efecto, en ese orden, para que "escribir" y "medir" nunca puedan desordenarse.
  //
  // La secuencia real arranca con ~18 fotogramas en negro (un fade-in intencional): medir
  // CUALQUIERA de esos fotogramas da scrollWidth/Height = 0 (no hay nada dibujado todavía),
  // y ESE fue el bug real detrás de "en el cel no se ve nada" — no era un problema de red ni
  // de Android: el tamaño de fuente se quedaba pegado en su valor base (sin achicar) porque
  // la única medición que se hacía caía siempre en un fotograma vacío, y el arte real
  // terminaba más ancho que su caja, mostrando solo una esquina en vez del dibujo completo.
  useEffect(() => {
    const pre = preRef.current;
    const container = containerRef.current;
    if (!frames || !pre || !container) return;

    if (!pre.textContent) pre.textContent = frameAt(frames, 0);

    // Escala tipo "contain": el arte se ve completo y centrado en ambos ejes. Calcula un
    // font-size final y lo aplica directo (nada de `transform: scale()`): escalar texto ya
    // rasterizado por composición es el mismo truco que dejaba las barras del ecualizador
    // sin animar en Android — en ciertos GPU/compositores móviles, un glifo diminuto
    // reescalado por transform puede rasterizar a nada, aunque en escritorio se vea
    // perfecto. Pedirle al motor de fuentes que dibuje directo al tamaño final (su propio
    // hinting, no una textura reescalada) es más robusto en cualquier plataforma.
    const measure = () => {
      // Busca el primer fotograma con contenido real para medir (saltando el fade-in en
      // negro): mide contra ESE, sin tocar lo que el <pre> esté mostrando en este momento
      // (solo lee scrollWidth/Height de un valor temporal y lo restaura de inmediato, todo
      // síncrono — no hay parpadeo visible).
      let i = 0;
      while (i < frames.offsets.length - 1 && frameAt(frames, i).trim().length === 0) i++;
      const shown = pre.textContent;
      pre.textContent = frameAt(frames, i);
      const currentPx = parseFloat(getComputedStyle(pre).fontSize) || fontSize;
      const w = (pre.scrollWidth / currentPx) * fontSize;
      const h = (pre.scrollHeight / currentPx) * fontSize;
      pre.textContent = shown;
      if (w <= 0 || h <= 0) return;
      const widthRatio = container.clientWidth / w;
      const heightRatio = container.clientHeight / h;
      const fit = heightRatio > 0 ? Math.min(widthRatio, heightRatio) : widthRatio;
      // Piso de 4px: mejor que el arte se recorte un poco (el contenedor tiene overflow
      // hidden) a que el texto se achique hasta quedar invisible en pantallas angostas.
      setRenderFontSize(Math.max(4, (fit > 0 ? fit : 1) * fontSize * scaleBoost));
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);

    // Reproducción: escribe el texto directamente, sin pasar por el estado de React.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    if (!isPaused && visible && !reduceMotion) {
      const frameCount = frames.offsets.length;
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
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [frames, visible, isPaused, fontSize, scaleBoost]);

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
      {/* Antes, en una conexión lenta, esta tarjeta se veía en blanco mientras bajaba el
          archivo (~880 KB comprimidos) y parecía rota. Ahora dice qué está pasando. */}
      {!frames && status !== 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
            {status === 'loading' && 'cargando animación…'}
            {status === 'saveData' && 'animación pausada (ahorro de datos activo)'}
            {status === 'error' && 'no se pudo cargar la animación'}
          </span>
        </div>
      )}
      <pre
        ref={preRef}
        aria-hidden="true"
        style={{
          fontFamily: 'inherit',
          fontSize: `${renderFontSize}px`,
          lineHeight: 0.78,
          margin: 0,
          whiteSpace: 'pre',
          color,
          flex: 'none',
        }}
      />
    </div>
  );
}

