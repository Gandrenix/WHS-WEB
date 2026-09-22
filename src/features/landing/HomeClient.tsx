'use client';
// Client: orquesta el scroll suave (Lenis) y las animaciones GSAP de scroll
// (useLandingAnimations) sobre las secciones de la landing, por eso todo el árbol
// vive en un boundary cliente.

import { useRef, type ReactNode } from 'react';
import { DepthIndicator } from '@/shared/ui/DepthIndicator';
import { useSmoothScroll } from '@/shared/hooks/useSmoothScroll';
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
  useSmoothScroll();
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
