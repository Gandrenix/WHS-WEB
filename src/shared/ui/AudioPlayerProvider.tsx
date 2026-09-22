'use client';
// Client: dueño único del reproductor de música del sitio. Renderiza el ÚNICO <audio> real
// que existe en toda la página (una sola vez, en la raíz) y el ÚNICO grafo de Web Audio —
// `createMediaElementSource` solo se puede llamar una vez por elemento en toda su vida, así
// que si el botón del header y la tarjeta "Diseño Sonoro" de la landing crearan cada uno su
// propio analizador sobre el mismo <audio>, el segundo tiraría una excepción. Cualquier UI
// del sitio que quiera mostrar/controlar el reproductor (el botón del header, la tarjeta de
// STRATA II, lo que sea después) consume `useAudioPlayer()` en vez de manejar su propio
// <audio>.
//
// Las barras de cada UI se calculan aparte (ver shared/hooks/useAudioBars): este provider
// solo expone los bytes de frecuencia más recientes en una ref compartida (`dataRef`), sin
// pasar por estado de React — leerla no re-renderiza nada, y cada UI decide cuántas barras
// quiere y cómo dibujarlas.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePlaylistPlayer, type Track } from '../hooks/usePlaylistPlayer';

interface AudioPlayerContextValue {
  songs: Track[];
  currentSong: Track | null;
  currentIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  /** Segundos de la canción actual, o null hasta que el navegador la carga lo suficiente para saberlo. */
  duration: number | null;
  toggle: () => void;
  toggleMute: () => void;
  selectTrack: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** Últimos bytes de frecuencia (0-255) leídos del analizador; null si nunca hubo señal o el CORS lo bloqueó. */
  dataRef: React.RefObject<Uint8Array<ArrayBuffer> | null>;
  /** true si el audio no se pudo conectar a Web Audio (bucket sin CORS): las UI deben caer a un pulso CSS. */
  isFallbackRef: React.RefObject<boolean>;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer debe usarse dentro de <AudioPlayerProvider>.');
  return ctx;
}

export function AudioPlayerProvider({ songs, children }: { songs: Track[]; children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const player = usePlaylistPlayer(songs, audioRef);
  const [duration, setDuration] = useState<number | null>(null);

  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const isFallbackRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceCreatedRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoadedMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : null);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    return () => audio.removeEventListener('loadedmetadata', onLoadedMetadata);
  }, []);

  // Crea el grafo de audio una sola vez, en el primer play real (gesto de usuario).
  useEffect(() => {
    if (!player.isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (!sourceCreatedRef.current && !isFallbackRef.current) {
      // Sin `crossOrigin`, este <audio> ya tuvo que reintentar sin CORS (ver
      // usePlaylistPlayer) porque el bucket no lo permite: conectarlo de todas formas a
      // Web Audio no tira error, pero SILENCIA el audio (contenido "tainted" cross-origin
      // enrutado por el grafo de Web Audio sale mudo aunque el <audio> siga
      // "reproduciendo"). Mejor perder solo el visualizador que perder el sonido.
      if (!audio.crossOrigin) {
        isFallbackRef.current = true;
      } else {
        try {
          const Ctx =
            window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new Ctx();
          const source = ctx.createMediaElementSource(audio);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.75;
          source.connect(analyser);
          analyser.connect(ctx.destination);
          ctxRef.current = ctx;
          analyserRef.current = analyser;
          // `new Uint8Array(n)` con este target de TS infiere un buffer ArrayBufferLike
          // (incluye SharedArrayBuffer), y getByteFrequencyData pide específicamente
          // ArrayBuffer — pasar por un ArrayBuffer explícito evita el choque de tipos.
          dataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
          sourceCreatedRef.current = true;
        } catch {
          isFallbackRef.current = true; // Web Audio no disponible: se queda en fallback.
        }
      }
    }

    const ctx = ctxRef.current;
    if (ctx?.state === 'suspended') void ctx.resume();

    const analyser = analyserRef.current;
    let checkedSignal = false;
    const startedAt = performance.now();

    const tick = (time: number) => {
      if (analyser && dataRef.current && !isFallbackRef.current) {
        analyser.getByteFrequencyData(dataRef.current);
        if (!checkedSignal && time - startedAt > 900) {
          checkedSignal = true;
          // Nunca hubo señal real en casi 1s: el bucket bloqueó el CORS a mitad de camino
          // (el <audio> cargó bien pero Web Audio está mudo). Cae a CSS igual que arriba.
          if (!dataRef.current.some((v) => v > 4)) isFallbackRef.current = true;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [player.isPlaying]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ songs, duration, dataRef, isFallbackRef, ...player }}>
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" className="hidden" />
      {children}
    </AudioPlayerContext.Provider>
  );
}
