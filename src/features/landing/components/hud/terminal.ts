// Primitivas imperativas de "terminal" para el HUD del Hero: escribir letra por letra y
// revelar cifras desde ruido. Escriben directo en el nodo de texto (sin estado de React),
// así un carácter nuevo no re-renderiza nada: solo repinta ese fragmento de texto.

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Escribe `text` en `el` a ~`cps` caracteres por segundo (con algo de irregularidad humana). */
export function typeInto(
  el: HTMLElement,
  text: string,
  { delay = 0, cps = 30, onDone }: { delay?: number; cps?: number; onDone?: () => void } = {}
): () => void {
  let i = 0;
  let timer = 0;
  el.textContent = '';
  const step = () => {
    i += 1;
    el.textContent = text.slice(0, i);
    if (i < text.length) timer = window.setTimeout(step, 1000 / cps + Math.random() * 22);
    else onDone?.();
  };
  timer = window.setTimeout(step, delay);
  return () => window.clearTimeout(timer);
}

/** Cifras que arrancan como ruido y se fijan de izquierda a derecha (el "GPS enganchando"). */
export function scrambleInto(
  el: HTMLElement,
  text: string,
  { delay = 0, duration = 1100, onStart, onDone }: { delay?: number; duration?: number; onStart?: () => void; onDone?: () => void } = {}
): () => void {
  let interval = 0;
  const starter = window.setTimeout(() => {
    onStart?.();
    const t0 = performance.now();
    const frame = () => {
      const t = Math.min(1, (performance.now() - t0) / duration);
      const locked = Math.floor(t * text.length);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        out += i < locked || !/\d/.test(c) ? c : String(Math.floor(Math.random() * 10));
      }
      el.textContent = out;
      if (t >= 1) {
        window.clearInterval(interval);
        el.textContent = text;
        onDone?.();
      }
    };
    interval = window.setInterval(frame, 45);
    frame();
  }, delay);
  return () => {
    window.clearTimeout(starter);
    window.clearInterval(interval);
  };
}
