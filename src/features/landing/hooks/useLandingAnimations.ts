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
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Animaciones del Hero
      gsap.fromTo(
        '.hero-h1',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.hero-p',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.hero-btns',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, delay: 0.4, ease: 'back.out(1.7)' }
      );

      // Animaciones al hacer scroll (Fade-up)
      const fadeElements = gsap.utils.toArray<HTMLElement>('.fade-up');
      fadeElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          }
        );
      });
    },
    { scope: containerRef }
  );
}
