import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '../types';

export interface ProjectCardProps {
  project: Project;
  variant?: 'light' | 'dark' | 'bedrock';
}

export function ProjectCard({ project, variant = 'light' }: ProjectCardProps) {
  const isLight = variant === 'light';
  const isBedrock = variant === 'bedrock';

  const categoryColors: Record<string, string> = {
    apps: 'bg-[#7ED957]/20 text-[#2b6b15] border-[#7ED957]/60 font-bold',
    app: 'bg-[#7ED957]/20 text-[#2b6b15] border-[#7ED957]/60 font-bold',
    manga: 'bg-[#8B2FE0]/15 text-[#8B2FE0] border-[#8B2FE0]/40',
    anime: 'bg-[#7ED957]/15 text-[#2b6b15] border-[#7ED957]/50',
    'visual-novel': 'bg-[#C084FC]/15 text-[#C084FC] border-[#C084FC]/40',
  };

  const currentCategoryColor =
    categoryColors[project.category.toLowerCase()] ||
    'bg-[#8B2FE0]/15 text-[#8B2FE0] border-[#8B2FE0]/40';

  return (
    <article
      className={`group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-md hover:shadow-xl border ${
        isBedrock
          ? 'bg-[#120A08] border-white/15 text-[#F2EDE4]'
          : !isLight
          ? 'bg-[#1A120E] border-white/10 text-[#F2EDE4]'
          : 'bg-white/90 border-[#3A3532]/15 text-[#0D0A08]'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-56 w-full overflow-hidden bg-black/60">
        <Image
          src={project.image_url || '/images/WIP.png'}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md ${currentCategoryColor}`}
          >
            {project.category}
          </span>
        </div>
        {/* Status & File Format Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {project.file_type && (
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#8B2FE0] text-white border border-[#C084FC]/50 uppercase tracking-wider backdrop-blur-md">
              {project.file_type === 'pdf' ? '📄 PDF' : '📖 MARKDOWN'}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-black/70 text-white border border-white/20 backdrop-blur-md">
            {project.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <h3
            className={`font-mono text-xl font-black mb-2 tracking-tight ${
              isLight ? 'text-[#0D0A08]' : 'text-white'
            }`}
          >
            {project.title}
          </h3>
          <p
            className={`font-sans text-xs leading-relaxed mb-6 line-clamp-3 ${
              isLight ? 'text-[#3A3532]' : 'text-[#F2EDE4]/80'
            }`}
          >
            {project.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-current/10 flex items-center justify-between">
          <Link
            href={`/categorias/${project.id}`}
            className={`inline-flex items-center gap-2 font-mono text-xs font-bold transition-colors ${
              isLight
                ? 'text-[#8B2FE0] hover:text-[#0D0A08]'
                : 'text-[#C084FC] hover:text-white'
            }`}
          >
            <span>{project.file_type ? 'LEER OBRA' : 'VER DETALLES'}</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
