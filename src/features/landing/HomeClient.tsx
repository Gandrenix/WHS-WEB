'use client';

import { DepthIndicator } from '@/shared/ui/DepthIndicator';
import { HeroEstrato } from './components/HeroEstrato';
import { InstinctSection } from './components/InstinctSection';
import { StrataOneSection } from './components/StrataOneSection';
import { StrataTwoSection } from './components/StrataTwoSection';
import { BedrockSection } from './components/BedrockSection';
import { ResurfaceSection } from './components/ResurfaceSection';
import type { Project } from '@/entities/project';

interface HomeClientProps {
  recentProjects?: Project[];
}

export function HomeClient({ recentProjects: _recentProjects }: HomeClientProps) {
  return (
    <div className="relative pr-[50px] md:pr-[130px]">
      <DepthIndicator />
      <main>
        <HeroEstrato />
        <InstinctSection />
        <StrataOneSection />
        <StrataTwoSection />
        <BedrockSection />
      </main>
      <ResurfaceSection />
    </div>
  );
}
