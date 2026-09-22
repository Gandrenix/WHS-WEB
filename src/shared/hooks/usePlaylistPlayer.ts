'use client';
// Client: maneja qué canción suena y si está sonando, para una playlist que llega de
// Supabase (ver entities/song). Un solo <audio> real vive en el DOM (lo renderiza
// AudioPlayerProvider, una sola vez para todo el sitio); este hook solo decide qué URL le
// toca — nunca precarga nada (`preload="none"`) hasta el primer play, así la playlist
// puede crecer sin pesar en la carga inicial de la página.

import { useEffect, useRef, useState, type RefObject } from 'react';

// `shared` nunca importa de `entities` (ver AGENTS.md): esta forma mínima es la única
// parte de `Song` (entities/song) que el reproductor necesita. `Song` la satisface
// estructuralmente sola, sin que este archivo tenga que importarla.
export interface Track {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  is_default: boolean;
}

export function usePlaylistPlayer(songs: Track[], audioRef: RefObject<HTMLAudioElement | null>) {
  // Arranca en la canción marcada is_default; si no hay ninguna marcada, la primera.
  const [currentIndex, setCurrentIndex] = useState(() => {
    const i = songs.findIndex((s) => s.is_default);
    return i >= 0 ? i : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const loadedIndexRef = useRef<number | null>(null);

  const currentSong = songs[currentIndex] ?? null;

  const ensureLoaded = (index: number) => {
    const audio = audioRef.current;
    const song = songs[index];
    if (!audio || !song) return;
    if (loadedIndexRef.current !== index) {
      audio.src = song.audio_url;
      loadedIndexRef.current = index;
    }
  };

  const play = (index = currentIndex) => {
    const audio = audioRef.current;
    if (!audio || songs.length === 0) return;
    setCurrentIndex(index);
    ensureLoaded(index);
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        // `crossOrigin="anonymous"` (necesario para que useAudioBars pueda leer el audio)
        // hace que el navegador exija CORS para la descarga misma: si el bucket no
        // responde Access-Control-Allow-Origin, el audio ni siquiera carga (no es solo el
        // visualizador el que se pierde). Reintenta UNA vez sin CORS — la canción suena
        // igual, solo se pierden las barras reactivas (el grafo de Web Audio en
        // AudioPlayerProvider se apaga solo al ver `audio.crossOrigin` vacío). Queda así
        // para el resto de la sesión: el mismo <audio> se reutiliza en todas las
        // canciones siguientes.
        if (audio.crossOrigin) {
          // `= null` (no `''`): por spec, `''` refleja al atributo `crossorigin=""`, que
          // sigue significando "Anonymous" — hay que QUITAR el atributo, y `null` es el
          // caso especial que Media/ImageElement.crossOrigin usa para eso.
          audio.crossOrigin = null;
          audio.load();
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch((err2) => console.log('Audio play blocked or failed (sin CORS tampoco):', err2));
          return;
        }
        console.log('Audio play blocked or failed:', err);
      });
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const toggle = () => {
    if (isPlaying) pause();
    else play(currentIndex);
  };

  const selectTrack = (index: number) => {
    if (index === currentIndex && isPlaying) return;
    play(index);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const step = (dir: 1 | -1) => {
    if (songs.length === 0) return;
    play((currentIndex + dir + songs.length) % songs.length);
  };

  // Auto-avanza a la siguiente al terminar; si es la última, vuelve a la primera
  // (playlist en loop, comportamiento esperado de un reproductor de música de fondo).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => step(1);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, songs.length]);

  return {
    currentSong,
    currentIndex,
    isPlaying,
    isMuted,
    toggle,
    toggleMute,
    selectTrack,
    next: () => step(1),
    prev: () => step(-1),
  };
}
