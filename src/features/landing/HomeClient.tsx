'use client';
// Client: orquesta las animaciones GSAP de scroll (useLandingAnimations) sobre las
// secciones de la landing, por eso todo el árbol vive en un boundary cliente.
//
// El scroll suave (Lenis) se probó y se quitó: agrega un desfase entre el input real
// (rueda/trackpad) y lo que se mueve en pantalla — a quien usa scroll nativo a diario
// le lee como "pegado/lento" en vez de "suave", que es justo lo que reportaron. El scroll
// nativo ya corre a ~59fps de por sí (medido), así que Lenis no compraba nada a cambio.
// Para reactivarlo: descomentar el import y `useSmoothScroll()` de abajo — sigue
// implementado en shared/hooks/useSmoothScroll.ts, solo dejó de llamarse acá.
// import { useSmoothScroll } from '@/shared/hooks/useSmoothScroll';

import { useRef, type ReactNode } from 'react';
import { DepthIndicator } from '@/shared/ui/DepthIndicator';
import { HeroEstrato } from './components/HeroEstrato';
import { InstinctSection } from './components/InstinctSection';
import { StrataOneSection } from './components/StrataOneSection';
import { StrataTwoSection } from './components/StrataTwoSection';
import { BedrockSection } from './components/BedrockSection';
import { ResurfaceSection } from './components/ResurfaceSection';
import { useLandingAnimations } from './hooks/useLandingAnimations';
import type { Project } from '@/entities/project';
import type { SpecimenCard } from '@/entities/specimen-card';
import type { FooterSocialLink } from '@/entities/footer-social-link';

interface HomeClientProps {
  recentProjects?: Project[];
  /** Fichas de STRATA I, editables desde /admin/dashboard/especimenes. */
  specimenCards: SpecimenCard[];
  /** Enlaces de "ENCUÉNTRANOS" del footer, editables desde /admin/dashboard/footer. */
  socialLinks: FooterSocialLink[];
  /** Botón de contacto ya resuelto por la página (composición vía app). */
  contactButton?: ReactNode;
}

export function HomeClient({
  recentProjects: _recentProjects,
  specimenCards,
  socialLinks,
  contactButton,
}: HomeClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useLandingAnimations(containerRef);

  return (
    <div ref={containerRef} className="relative pr-[50px] md:pr-[130px] bg-[#0D0A08]">
      <DepthIndicator />
      <main>
        <HeroEstrato />
        <InstinctSection />
        <StrataOneSection specimenCards={specimenCards} />
        <StrataTwoSection />
        <BedrockSection />
      </main>
      <ResurfaceSection contactButton={contactButton} socialLinks={socialLinks} />
    </div>
  );
}

