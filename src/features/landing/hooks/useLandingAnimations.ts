'use client';
// Client: maneja animaciones GSAP para la landing page utilizando useGSAP con scope explícito

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function useLandingAnimations(containerRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const fadeElements = gsap.utils.toArray<HTMLElement>('.fade-up');

      // .fade-up arranca invisible por CSS (globals.css); si el usuario pide
      // menos movimiento la revelamos de inmediato en vez de dejarla oculta.
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(fadeElements, { opacity: 1, y: 0 });
        return;
      }

      // Revelado por estratos: las tarjetas "emergen" al hacer scroll, en vez
      // de aparecer de golpe — refuerza la narrativa de excavar hacia abajo.
      fadeElements.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
            },
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: (i % 4) * 0.08,
            ease: 'power2.out',
          }
        );
      });
    },
    { scope: containerRef }
  );
}
