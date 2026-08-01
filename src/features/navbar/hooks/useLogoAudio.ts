'use client';
// Client: maneja el estado y ciclo de vida del audio del logo easter egg

import { useState, useEffect, useRef } from 'react';

export function useLogoAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/audio/musica-fondo.mp3');
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleMusic = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio play blocked or failed:', err));
    }
  };

  return { isPlaying, toggleMusic };
}
