'use client';

import { useState } from 'react';
import { ProjectCard, type Project } from '@/entities/project';
import { StarsBackground } from '@/shared/ui/StarsBackground';

export interface CategoriesClientProps {
  initialProjects: Project[];
}

export function CategoriesClient({ initialProjects }: CategoriesClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'apps' | 'animaciones' | 'visual-novel' | 'games'>('all');

  // Sin fallback de proyectos demo: el catálogo refleja el estado real de
  // Supabase, incluyendo el caso legítimo de "no hay obras todavía".
  const projectsToUse = initialProjects;

  const getProjectsByCategory = (category: string) => {
    return projectsToUse.filter((p) => {
      const cat = p.category ? p.category.toLowerCase() : '';
      if (category === 'apps') {
        return (
          cat === 'apps' ||
          cat === 'app' ||
          cat === 'apps-software' ||
          cat.includes('app') ||
          cat.includes('software')
        );
      }
      // "Animaciones" fusiona lo que antes eran Manga y Anime como categorías
      // separadas, así que también reconoce esos valores viejos guardados en la DB.
      if (category === 'animaciones') {
        return cat === 'animaciones' || cat === 'manga' || cat === 'anime';
      }
      return cat === category.toLowerCase();
    });
  };

  const appProjects = getProjectsByCategory('apps');
  const animacionesProjects = getProjectsByCategory('animaciones');
  const vnProjects = getProjectsByCategory('visual-novel');
  const gamesProjects = getProjectsByCategory('games');

  return (
    <StarsBackground opacity={0.75} count={180} fontSize={14} speed={0.6} color="#FFFFFF" accentColor="#E0AAFF" density={0.6} className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] font-sans">
      {/* Hero Header */}
      <section className="py-24 bg-transparent border-b border-white/10 text-center relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B2FE0]/30 text-[#C084FC] font-mono text-xs font-bold uppercase tracking-widest mb-6 border border-[#8B2FE0]/50 shadow-lg">
            ✨ CATÁLOGO &bull; S I S T E M A &nbsp; E S T R A T O
          </div>

          <h1 className="font-mono text-4xl sm:text-6xl font-black uppercase text-white mb-4 tracking-tight drop-shadow-md">
            Obras y Publicaciones
          </h1>
          <p className="font-sans text-base md:text-lg text-[#F2EDE4] max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Exploración del catálogo de Wiener Hound Studios: Apps, Animaciones, Visual Novels y Games.
          </p>

          {/* Filter Bar */}
          <div className="flex flex-wrap justify-center gap-3 font-mono text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-[#8B2FE0] text-white shadow-xl scale-105'
                  : 'bg-black/70 text-[#F2EDE4] hover:bg-black border border-white/20'
              }`}
            >
              TODAS LAS OBRAS ({projectsToUse.length})
            </button>

            <a
              href="#apps"
              onClick={() => setSelectedFilter('apps')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer border ${
                selectedFilter === 'apps'
                  ? 'bg-[#7ED957] text-[#0D0A08] border-[#7ED957] shadow-xl scale-105'
                  : 'bg-black/70 text-[#7ED957] hover:bg-black border-[#7ED957]/50'
              }`}
            >
              APPS ({appProjects.length})
            </a>

            <a
              href="#animaciones"
              onClick={() => setSelectedFilter('animaciones')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer border ${
                selectedFilter === 'animaciones'
                  ? 'bg-[#8B2FE0] text-white border-[#8B2FE0] shadow-xl scale-105'
                  : 'bg-black/70 text-[#C084FC] hover:bg-black border-[#8B2FE0]/50'
              }`}
            >
              ANIMACIONES ({animacionesProjects.length})
            </a>

            <a
              href="#visual-novel"
              onClick={() => setSelectedFilter('visual-novel')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer border ${
                selectedFilter === 'visual-novel'
                  ? 'bg-[#C084FC] text-[#0D0A08] border-[#C084FC] shadow-xl scale-105'
                  : 'bg-black/70 text-[#C084FC] hover:bg-black border-[#C084FC]/50'
              }`}
            >
              VISUAL NOVELS ({vnProjects.length})
            </a>

            <a
              href="#games"
              onClick={() => setSelectedFilter('games')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer border ${
                selectedFilter === 'games'
                  ? 'bg-[#FFD700] text-[#0D0A08] border-[#FFD700] shadow-xl scale-105'
                  : 'bg-black/70 text-[#FFD700] hover:bg-black border-[#FFD700]/50'
              }`}
            >
              GAMES ({gamesProjects.length})
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 0: APPS & HEALTHTECH */}
      {(selectedFilter === 'all' || selectedFilter === 'apps') && (
        <section id="apps" className="py-20 bg-transparent border-b border-white/10 relative z-10">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/15">
              <span className="px-3 py-1 bg-[#7ED957] text-[#0D0A08] font-mono text-xs font-bold rounded">
                00
              </span>
              <h2 className="font-mono text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                Apps &amp; Plataformas BioTech
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {appProjects.length > 0 ? (
                appProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} variant="bedrock" />
                ))
              ) : (
                <p className="text-[#F2EDE4]/80 text-center col-span-full py-12 font-mono text-sm font-bold bg-[#160E0A]/90 rounded-2xl border border-white/20 shadow-xl">
                  Aún no hay publicaciones registradas en la categoría Apps.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 1: ANIMACIONES (fusiona lo que antes eran Manga y Anime) */}
      {(selectedFilter === 'all' || selectedFilter === 'animaciones') && (
        <section id="animaciones" className="py-20 bg-transparent border-b border-white/10 relative z-10">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/15">
              <span className="px-3 py-1 bg-[#8B2FE0] text-white font-mono text-xs font-bold rounded">
                01
              </span>
              <h2 className="font-mono text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                Animaciones
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {animacionesProjects.length > 0 ? (
                animacionesProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} variant="bedrock" />
                ))
              ) : (
                <p className="text-[#F2EDE4]/80 text-center col-span-full py-12 font-mono text-sm font-bold bg-[#160E0A]/90 rounded-2xl border border-white/20 shadow-xl">
                  Aún no hay publicaciones registradas en la categoría Animaciones.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: VISUAL NOVELS */}
      {(selectedFilter === 'all' || selectedFilter === 'visual-novel') && (
        <section id="visual-novel" className="py-20 bg-transparent border-b border-white/10 relative z-10">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/15">
              <span className="px-3 py-1 bg-[#C084FC] text-[#0D0A08] font-mono text-xs font-bold rounded">
                02
              </span>
              <h2 className="font-fraunces text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                Visual Novels &amp; Narrativa Inmersiva
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vnProjects.length > 0 ? (
                vnProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} variant="bedrock" />
                ))
              ) : (
                <p className="text-[#F2EDE4]/80 text-center col-span-full py-12 font-mono text-sm font-bold bg-[#160E0A]/90 rounded-2xl border border-white/20 shadow-xl">
                  Aún no hay publicaciones registradas en la categoría Visual Novels.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: GAMES */}
      {(selectedFilter === 'all' || selectedFilter === 'games') && (
        <section id="games" className="py-20 bg-transparent relative z-10">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/15">
              <span className="px-3 py-1 bg-[#FFD700] text-[#0D0A08] font-mono text-xs font-bold rounded">
                03
              </span>
              <h2 className="font-bricolage text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                Games
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gamesProjects.length > 0 ? (
                gamesProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} variant="dark" />
                ))
              ) : (
                <p className="text-[#F2EDE4]/80 text-center col-span-full py-12 font-mono text-sm font-bold bg-[#160E0A]/90 rounded-2xl border border-white/20 shadow-xl">
                  Aún no hay publicaciones registradas en la categoría Games.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </StarsBackground>
  );
}
