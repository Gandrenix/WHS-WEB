'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  image_url: string | null;
}

export default function CategoriasClient({ initialProjects }: { initialProjects: Project[] }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray<HTMLElement>('.fade-up').forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 50 }, 
        {
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
          },
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "power2.out"
        }
      );
    });
  }, []);

  const getProjectsByCategory = (category: string) => {
    return initialProjects.filter(p => p.category === category);
  };

  const renderProjectCard = (project: Project) => (
    <article key={project.id} className="project-card flex flex-col bg-[#121214] rounded-[16px] overflow-hidden border border-white/5 transition-all duration-400 hover:-translate-y-2 group">
      <div className="card-image h-[240px] relative overflow-hidden bg-black/50">
        <Image 
          src={project.image_url || "/images/WIP.png"} 
          alt={project.title} 
          fill
          className="object-cover transition-transform duration-600 group-hover:scale-108" 
        />
      </div>
      <div className="card-content flex-grow p-[25px] flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-[1.5rem] text-[#f8fafc] font-poppins font-bold">{project.title}</h4>
          <span className="text-xs text-[#00e68a] border border-[#00e68a]/30 px-2 py-1 rounded whitespace-nowrap">{project.status}</span>
        </div>
        <p className="text-[1.05rem] text-[#94a3b8] flex-grow mb-[25px]">{project.description}</p>
        <Link href="#" className="btn-secondary">Detalles</Link>
      </div>
    </article>
  );

  return (
    <main>
      <section id="manga" className="category-section fade-up pt-[120px] pb-[100px] border-b border-white/5 bg-[#0a0a0b]">
        <div className="container-custom">
          <h2>Manga</h2>
          <div className="project-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[40px]">
             {getProjectsByCategory('manga').length > 0 ? (
               getProjectsByCategory('manga').map(renderProjectCard)
             ) : (
               <p className="text-[#94a3b8] text-center col-span-full py-10">Aún no hay proyectos de manga publicados.</p>
             )}
          </div>
        </div>
      </section>

      <section id="anime" className="category-section fade-up pt-[120px] pb-[100px] border-b border-white/5 bg-[#0a0a0b]">
        <div className="container-custom">
          <h2>Anime</h2>
          <div className="project-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[40px]">
             {getProjectsByCategory('anime').length > 0 ? (
               getProjectsByCategory('anime').map(renderProjectCard)
             ) : (
               <p className="text-[#94a3b8] text-center col-span-full py-10">Aún no hay proyectos de anime publicados.</p>
             )}
          </div>
        </div>
      </section>

      <section id="visual-novel" className="category-section fade-up pt-[120px] pb-[100px] bg-[#0a0a0b]">
        <div className="container-custom">
          <h2>Visual Novel</h2>
          <div className="project-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[40px]">
             {getProjectsByCategory('visual-novel').length > 0 ? (
               getProjectsByCategory('visual-novel').map(renderProjectCard)
             ) : (
               <p className="text-[#94a3b8] text-center col-span-full py-10">Aún no hay proyectos de visual novel publicados.</p>
             )}
          </div>
        </div>
      </section>
    </main>
  );
}
