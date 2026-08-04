'use client';

import type { ReactNode } from 'react';
import { DepthIndicator } from '@/shared/ui/DepthIndicator';
import { HeroEstrato } from './components/HeroEstrato';
import { InstinctSection } from './components/InstinctSection';
import { StrataOneSection } from './components/StrataOneSection';
import { StrataTwoSection } from './components/StrataTwoSection';
import { BedrockSection } from './components/BedrockSection';
import { ResurfaceSection } from './components/ResurfaceSection';
import type { Project } from '@/entities/project';
import type { SpecimenCard } from '@/entities/specimen-card';

interface HomeClientProps {
  recentProjects?: Project[];
  /** Fichas de STRATA I, editables desde /admin/dashboard/especimenes. */
  specimenCards: SpecimenCard[];
  /** Botón de contacto ya resuelto por la página (composición vía app). */
  contactButton?: ReactNode;
}

export function HomeClient({ recentProjects: _recentProjects, specimenCards, contactButton }: HomeClientProps) {
  return (
    <div className="relative pr-[50px] md:pr-[130px]">
      <DepthIndicator />
      <main>
        <HeroEstrato />
        <InstinctSection />
        <StrataOneSection specimenCards={specimenCards} />
        <StrataTwoSection />
        <BedrockSection />
      </main>
      <ResurfaceSection contactButton={contactButton} />
    </div>
  );
}
