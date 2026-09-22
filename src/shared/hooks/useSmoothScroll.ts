'use client';
// Client: activa el scroll suave (ver shared/lib/smoothScroll) mientras la página esté montada.

import { useEffect } from 'react';
import { startSmoothScroll } from '../lib/smoothScroll';

export function useSmoothScroll(): void {
  useEffect(() => startSmoothScroll(), []);
}
