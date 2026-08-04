import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import type { ProgressWithProject } from '../types';

export function ContinueReadingCard({ item }: { item: ProgressWithProject }) {
  const { project, chapterNumber, totalChapters, status } = item;
  // Solo mostramos % cuando la obra tiene capítulos reales que contar (markdown con
  // varios capítulos). Para PDF/video/galería/markdown de un solo bloque no hay forma
  // honesta de medir un avance parcial, así que mostramos un estado en vez de inventar un número.
  const isChaptered = totalChapters > 1;
  const percent = isChaptered ? Math.round((chapterNumber / totalChapters) * 100) : null;

  return (
    <Link
      href={`/categorias/${project.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-[#120A08] border border-white/10 hover:border-[#8B2FE0]/50 shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-36 w-full overflow-hidden bg-black/60">
        <Image
          src={project.image_url || '/images/WIP.png'}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-black/70 border border-white/20 text-white backdrop-blur-md">
          {isChaptered ? `Cap. ${chapterNumber}` : status === 'completed' ? 'Completado' : 'En curso'}
        </div>
        {status === 'completed' && (
          <div className="absolute top-2 right-2 text-[#7ED957] bg-black/70 rounded-full p-1 border border-[#7ED957]/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2.5">
        <h3 className="font-mono text-sm font-black text-white truncate">{project.title}</h3>

        {isChaptered ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8B2FE0] to-[#7ED957] transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#F2EDE4]/60 shrink-0">{percent}%</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider">
            {status === 'completed' ? (
              <span className="text-[#7ED957] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completado
              </span>
            ) : (
              <span className="text-[#C084FC] flex items-center gap-1">
                <PlayCircle className="w-3.5 h-3.5" /> En curso
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
