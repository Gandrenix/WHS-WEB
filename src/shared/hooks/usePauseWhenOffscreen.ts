'use client';
// Client: pausa las animaciones CSS de un bloque mientras está fuera de pantalla.
// Marca data-inview en el elemento (sin estado de React, así no re-renderiza) y
// globals.css pausa `animation-play-state` de todo lo que hay dentro. Los pulsos de
// isolínea animan stroke-dashoffset en el hilo principal (no en el compositor), así
// que dejarlos correr fuera de vista gastaría CPU sin que nadie los vea.

import { useEffect, type RefObject } from 'react';

export function usePauseWhenOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => el.setAttribute('data-inview', entry.isIntersecting ? 'true' : 'false'),
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}
