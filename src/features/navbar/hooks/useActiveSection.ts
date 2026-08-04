'use client';
// Client: detecta qué sección de la página está a la vista, para resaltar el link activo en el header
// Usa el mismo criterio (punto medio del viewport) que DepthIndicator, para que ambos indicadores concuerden

import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: readonly string[], enabled: boolean) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) {
      setActiveId(null);
      return;
    }

    const handleScroll = () => {
      let current: string | null = null;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            current = sectionIds[i];
            break;
          }
        }
      }

      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, enabled]);

  return activeId;
}
