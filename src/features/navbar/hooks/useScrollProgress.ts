'use client';
// Client: avance de scroll de la página (0 a 1) para la barra de excavación del header.
// Escribe directo en el elemento (transform: scaleX) en vez de usar estado de React: con
// estado, el Navbar completo se re-renderizaba en CADA evento de scroll, y con width
// animado además forzaba un layout por fotograma.

import { useEffect, type RefObject } from 'react';

export function useScrollProgress(barRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let raf = 0;
    // La altura total se cachea: leer scrollHeight en cada fotograma, justo después de que
    // otro componente cambió algo en el DOM, forzaba un layout completo por fotograma.
    let totalHeight = 0;
    const measure = () => {
      totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    };

    const update = () => {
      raf = 0;
      const bar = barRef.current;
      if (!bar) return;
      const progress = totalHeight <= 0 ? 0 : Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
      bar.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const remeasure = () => {
      measure();
      schedule();
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure, { passive: true });
    measure();
    update();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [barRef]);
}
