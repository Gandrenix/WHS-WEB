'use client';

import { useEffect, useState } from 'react';

const STRATA_LEVELS = [
  { id: 'superficie', name: 'SUPERFICIE', depth: '0m', code: '00' },
  { id: 'strata-1', name: 'STRATA I', depth: '-120m', code: '01' },
  { id: 'strata-2', name: 'STRATA II', depth: '-420m', code: '02' },
  { id: 'bedrock', name: 'BEDROCK', depth: '-666m', code: '03' },
  { id: 'resurface', name: 'RESURFACED', depth: 'END', code: '04' },
];

export function DepthIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStrata, setActiveStrata] = useState('superficie');

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
        setScrollProgress(currentProgress);
      }

      for (let i = STRATA_LEVELS.length - 1; i >= 0; i--) {
        const section = document.getElementById(STRATA_LEVELS[i].id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            setActiveStrata(STRATA_LEVELS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside
      aria-label="Indicador de Profundidad ESTRATO"
      className="fixed right-0 bottom-0 w-[50px] md:w-[130px] z-[70] bg-[#0D0A08]/95 backdrop-blur-md text-[#F2EDE4] border-l border-white/15 flex flex-col justify-between py-6 px-1 md:px-3 font-mono select-none"
      style={{ top: 'var(--header-height, 66px)' }}
    >
      {/* Dynamic Progress Line & Dachshund Marker */}
      <div className="absolute left-2.5 md:left-4 top-10 bottom-10 w-[2px] bg-white/20">
        <div
          className="w-full bg-[#8B2FE0] transition-all duration-150"
          style={{ height: `${scrollProgress * 100}%` }}
        />
        {/* Animated Mascot Icon */}
        <div
          className="absolute -left-[11px] md:-left-[13px] transition-all duration-150 ease-out"
          style={{ top: `${scrollProgress * 100}%` }}
        >
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#8B2FE0] text-white flex items-center justify-center text-[9px] md:text-[10px] font-bold shadow-[0_0_12px_#8B2FE0]">
            🐕
          </div>
        </div>
      </div>

      {/* Strata Labels */}
      <div className="flex flex-col justify-between h-full pl-5 md:pl-7">
        {STRATA_LEVELS.map((level) => {
          const isActive = activeStrata === level.id;
          return (
            <button
              key={level.id}
              onClick={() => scrollToSection(level.id)}
              className={`text-left transition-all duration-300 group cursor-pointer ${
                isActive ? 'text-[#8B2FE0] font-bold scale-105' : 'text-white/50 hover:text-white'
              }`}
            >
              <div className="uppercase tracking-wider text-[9px] md:text-[11px] font-bold leading-tight">
                <span className="hidden md:inline">{level.name}</span>
                <span className="inline md:hidden">{level.code}</span>
              </div>
              <div className="text-[9px] text-[#7ED957] font-semibold hidden md:block mt-0.5">
                {level.depth}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
