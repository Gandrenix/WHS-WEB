'use client';
// Client: dibuja N barras reactivas al audio que está sonando (ver shared/ui/AudioPlayerProvider,
// que es quien de verdad lee el micrófono — perdón, el analizador). Cada UI (el botón del
// header con 3 barras, la tarjeta "Diseño Sonoro" con 18) llama a este hook con su propio
// `barRefs` y el número de barras que quiera: todas leen los mismos bytes de frecuencia
// compartidos, nadie crea su propio grafo de Web Audio (eso solo puede pasar una vez por
// <audio>, y el provider ya lo hizo).
//
// Reparto de bandas: exponencial, no lineal — la energía de una canción vive en graves y
// medios, así que esas barras usan casi toda la resolución disponible y los agudos (casi
// silenciosos en la mayoría de música) quedan comprimidos en poco espacio. Sin esto, con
// muchas barras (18 en la tarjeta) la mitad derecha se ve siempre plana.

import { useEffect, type RefObject } from 'react';
import { useAudioPlayer } from '../ui/AudioPlayerProvider';

/** No se usa más allá de la mitad del espectro: ahí arriba un mp3 típico casi no tiene energía. */
const MAX_FREQ_FRACTION = 0.5;

function bandFor(barCount: number, i: number): readonly [number, number] {
  const from = MAX_FREQ_FRACTION * (i / barCount) ** 1.8;
  const to = MAX_FREQ_FRACTION * ((i + 1) / barCount) ** 1.8;
  return [from, to];
}

export function useAudioBars(barCount: number, barRefs: RefObject<Array<HTMLElement | null>>) {
  const { isPlaying, dataRef, isFallbackRef } = useAudioPlayer();

  useEffect(() => {
    if (!isPlaying) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    const tick = () => {
      const bars = barRefs.current;
      const data = dataRef.current;
      if (bars && !reduceMotion) {
        for (let i = 0; i < barCount; i++) {
          const el = bars[i];
          if (!el) continue;
          const fallback = isFallbackRef.current || !data;
          el.classList.toggle('eq-bar', fallback);
          if (!fallback && data) {
            const [from, to] = bandFor(barCount, i);
            const a = Math.floor(from * data.length);
            const b = Math.max(a + 1, Math.floor(to * data.length));
            let sum = 0;
            for (let j = a; j < b; j++) sum += data[j];
            const level = sum / (b - a) / 255;
            el.style.height = `${Math.max(10, Math.min(100, level * 100 + 10))}%`;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, barCount, barRefs, dataRef, isFallbackRef]);
}
