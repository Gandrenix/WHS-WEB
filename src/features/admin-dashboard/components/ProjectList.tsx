import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/entities/project';

export interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-20 bg-[#160E0A] rounded-2xl border border-dashed border-white/20 flex flex-col items-center font-mono">
        <div className="w-16 h-16 bg-[#8B2FE0]/20 rounded-full flex items-center justify-center mb-4 border border-[#8B2FE0]/40">
          <span className="text-2xl">📁</span>
        </div>
        <h3 className="text-white text-xl font-black mb-2 uppercase tracking-tight">
          BASE DE DATOS SIN REGISTROS
        </h3>
        <p className="text-[#F2EDE4]/70 text-xs mb-6 max-w-sm font-sans">
          No se encontraron especímenes de publicación. Haz clic abajo para registrar tu primera obra.
        </p>
        <Link
          href="/admin/dashboard/nuevo"
          className="bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg"
        >
          + REGISTRAR PRIMERA OBRA
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-mono">
      {projects.map((project) => {
        const cat = project.category.toLowerCase();
        const categoryBadgeColor =
          cat === 'apps' || cat === 'app'
            ? 'bg-[#7ED957]/20 text-[#7ED957] border-[#7ED957]/50'
            : cat === 'manga'
            ? 'bg-[#8B2FE0]/20 text-[#C084FC] border-[#8B2FE0]/50'
            : cat === 'anime'
            ? 'bg-[#7ED957]/20 text-[#7ED957] border-[#7ED957]/50'
            : 'bg-[#C084FC]/20 text-[#C084FC] border-[#C084FC]/50';

        return (
          <div
            key={project.id}
            className="bg-[#160E0A] border border-white/15 rounded-2xl overflow-hidden hover:border-[#8B2FE0] transition-all group flex flex-col shadow-lg"
          >
            {/* Image Preview */}
            <div className="h-48 w-full bg-black/60 relative border-b border-white/10">
              {project.image_url ? (
                <Image
                  src={project.image_url}
                  alt={project.title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#F2EDE4]/50 text-xs gap-2">
                  <span className="text-2xl">🖼️</span>
                  <span>Sin Portada</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span
                  className={`backdrop-blur-md border text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider font-bold ${categoryBadgeColor}`}
                >
                  {project.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3
                  className="font-mono font-black text-lg text-white mb-2 line-clamp-1 uppercase tracking-tight"
                  title={project.title}
                >
                  {project.title}
                </h3>
                <p className="font-sans text-xs text-[#F2EDE4]/80 mb-4 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-md font-bold bg-[#7ED957]/20 text-[#7ED957] border border-[#7ED957]/40 text-[10px]">
                  ● {project.status}
                </span>
                <span className="text-xs text-[#C084FC] font-bold">ACTIVO</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
