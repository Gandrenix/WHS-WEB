'use client';
// Client: scroll suave con inercia (Lenis) sincronizado con GSAP/ScrollTrigger. La rueda
// del mouse avanza a saltos discretos; Lenis los interpola y ScrollTrigger recibe cada
// posición intermedia en el mismo fotograma del ticker de GSAP, así el parallax y el scroll
// van pegados. En táctil se deja el scroll nativo (ya tiene inercia propia), y con
// prefers-reduced-motion no se activa.
//
// `lerp` es cuánto de la distancia restante recorre cada fotograma: más alto = alcanza el
// destino más rápido = se siente más parecido al scroll nativo; más bajo = más
// "flotante"/rezagado. La primera vez quedó en 0.1 (el default de Lenis, bastante marcado)
// y se sintió "pegado" — quien usa scroll nativo todo el día lee ese rezago como lentitud.
// 0.4 deja solo un roce de suavizado (~15-20% de lo que se notaba antes): apenas limpia el
// salto entre "ticks" de la rueda, sin el arrastre perceptible del valor original.
const LERP = 0.4;

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let instance: Lenis | null = null;

/** Arranca el scroll suave; devuelve la función que lo apaga. */
export function startSmoothScroll(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const lenis = new Lenis({
    lerp: LERP,
    // Diálogos y zonas con su propio scroll interno conservan el scroll nativo.
    prevent: (node) => Boolean(node.closest('[role="dialog"], [data-lenis-prevent]')),
  });
  instance = lenis;

  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);

  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
    if (instance === lenis) instance = null;
  };
}

/** Lleva el scroll a una sección: con inercia si el scroll suave está activo, nativo si no. */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) instance.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
}
