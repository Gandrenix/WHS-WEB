'use client';
// Client: conecta un <audio> a un AnalyserNode (Web Audio API) y, mientras suena, escribe
// la altura de cada barra directo en el DOM por ref — igual que el resto de animaciones
// del sitio (FlowPulse, DepthIndicator): nada de esto pasa por estado de React, así que un
// fotograma de audio no re-renderiza el header.
//
// Dos cosas no obvias:
// 1. `createMediaElementSource` solo se puede llamar UNA VEZ por elemento <audio> en toda
//    su vida — llamarlo dos veces tira una excepción. El nodo se crea perezoso, en el
//    primer play() (necesita un gesto del usuario: los navegadores arrancan el
//    AudioContext suspendido si no hay uno), y se reutiliza para todas las canciones
//    siguientes (solo cambia `audio.src`, el grafo de audio no se reconstruye).
// 2. Leer los bytes de frecuencia requiere que la respuesta del audio tenga CORS
//    habilitado (`crossOrigin="anonymous"` en el elemento + el bucket de Storage
//    respondiendo Access-Control-Allow-Origin). Si por lo que sea no es así, el analyser
//    no tira error: devuelve ceros en silencio. Por eso se vigilan los primeros ~1s de
//    reproducción y, si nunca hay señal, se cae a un pulso CSS aproximado en vez de barras
//    planas para siempre.

import { useEffect, useRef, type RefObject } from 'react';

const BAR_COUNT = 3;
/** Bandas del espectro (graves/medios/agudos) por barra, como fracción de las frecuencias disponibles. */
const BAR_BANDS: ReadonlyArray<readonly [number, number]> = [
  [0, 0.08],
  [0.08, 0.22],
  [0.22, 0.45],
];

export function useAudioVisualizer(
  audioRef: RefObject<HTMLAudioElement | null>,
  barRefs: RefObject<Array<HTMLElement | null>>,
  isPlaying: boolean
) {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceCreatedRef = useRef(false);
  const fallbackRef = useRef(false);
  const rafRef = useRef(0);

  // Crea el grafo de audio una sola vez, en el primer play (gesto de usuario real).
  const ensureGraph = () => {
    const audio = audioRef.current;
    if (!audio || sourceCreatedRef.current || fallbackRef.current) return;
    // Sin `crossOrigin`, este <audio> ya tuvo que reintentar sin CORS (ver
    // usePlaylistPlayer) porque el bucket no lo permite: conectarlo de todas formas a
    // Web Audio no tira error, pero SILENCIA el audio (contenido "tainted" cross-origin
    // enrutado por el grafo de Web Audio sale mudo aunque el <audio> siga "reproduciendo").
    // Mejor perder solo el visualizador que perder el sonido.
    if (!audio.crossOrigin) {
      fallbackRef.current = true;
      return;
    }
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      sourceCreatedRef.current = true;
    } catch {
      // Web Audio no disponible (navegador viejo, política restrictiva): se queda en fallback.
      fallbackRef.current = true;
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    ensureGraph();
    const ctx = ctxRef.current;
    if (ctx?.state === 'suspended') void ctx.resume();

    const analyser = analyserRef.current;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let checkedSignal = false;
    let sawSignal = false;
    const startedAt = performance.now();

    const tick = (time: number) => {
      const bars = barRefs.current;
      if (reduceMotion || !bars) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (analyser && data && !fallbackRef.current) {
        analyser.getByteFrequencyData(data);
        if (!checkedSignal) {
          if (data.some((v) => v > 4)) sawSignal = true;
          if (time - startedAt > 900) {
            checkedSignal = true;
            if (!sawSignal) fallbackRef.current = true; // CORS bloqueado u otra fuente muda: cae a CSS
          }
        }
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        const el = bars[i];
        if (!el) continue;
        let level = 0.35;
        if (analyser && data && !fallbackRef.current) {
          const [from, to] = BAR_BANDS[i];
          const a = Math.floor(from * data.length);
          const b = Math.max(a + 1, Math.floor(to * data.length));
          let sum = 0;
          for (let j = a; j < b; j++) sum += data[j];
          level = sum / (b - a) / 255;
        }
        const height = fallbackRef.current ? undefined : `${Math.max(14, Math.min(100, level * 100 + 14))}%`;
        if (height) el.style.height = height;
        el.classList.toggle('eq-bar', fallbackRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // ensureGraph se redefine cada render pero es idempotente (sourceCreatedRef la corta
    // en el segundo llamado): incluirla forzaría reconstruir el efecto sin necesidad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, audioRef, barRefs]);

  // El AudioContext se cierra al desmontar el header (nunca pasa en la práctica: el
  // header vive toda la sesión, pero es la limpieza correcta si algún día cambia).
  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);
}
