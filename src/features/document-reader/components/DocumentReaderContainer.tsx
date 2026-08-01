'use client';

import type { Project } from '@/entities/project';
import { PdfReader } from './PdfReader';
import { MarkdownReader } from './MarkdownEngine/MarkdownReader';
import { StarsBackground } from '@/shared/ui/StarsBackground';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';

export interface DocumentReaderContainerProps {
  project: Project;
}

export function DocumentReaderContainer({ project }: DocumentReaderContainerProps) {
  // 1. Visor de PDF
  if (project.file_type === 'pdf' && project.document_url) {
    return <PdfReader documentUrl={project.document_url} title={project.title} />;
  }

  // 2. Visor de Markdown / Obsidian
  if (project.file_type === 'markdown' && (project.markdown_content || project.document_url)) {
    const rawContent =
      project.markdown_content ||
      `# ${project.title}\n\n${project.description}\n\n*Documento disponible en: ${project.document_url}*`;

    return (
      <div className="min-h-screen bg-[#0D0A08] text-[#F2EDE4]">
        {/* Navigation Bar */}
        <nav className="bg-[#120A08] border-b border-white/15 px-6 py-4 flex items-center justify-between sticky top-0 z-40 font-mono text-xs">
          <Link
            href="/categorias"
            className="p-2 bg-black/60 hover:bg-[#8B2FE0] text-white rounded-xl border border-white/20 transition-all font-bold flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> CATÁLOGO
          </Link>
          <span className="text-[#C084FC] font-bold uppercase tracking-wider hidden sm:inline">
            SISTEMA ESTRATO &bull; LECTOR DE OBRAS
          </span>
        </nav>

        <MarkdownReader content={rawContent} title={project.title} />
      </div>
    );
  }

  // 3. Fallback: Ficha Técnica de la Obra sin documento adjunto
  return (
    <StarsBackground className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] font-mono py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/categorias"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-[#8B2FE0] text-white rounded-xl border border-white/20 transition-all font-bold text-xs mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER AL CATÁLOGO
        </Link>

        <div className="bg-[#120A08] border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative h-80 w-full bg-black/60">
            <Image
              src={project.image_url || '/images/WIP.png'}
              alt={project.title}
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#8B2FE0] text-white border border-[#C084FC]/50 backdrop-blur-md">
                {project.category}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-black/80 text-white border border-white/20 backdrop-blur-md">
                {project.status}
              </span>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 text-[#7ED957] text-xs font-bold uppercase tracking-widest mb-3">
              <Layers className="w-4 h-4" /> FICHA TÉCNICA
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-6">
              {project.title}
            </h1>

            <p className="font-sans text-base leading-relaxed text-[#F2EDE4]/90 mb-8 whitespace-pre-wrap">
              {project.description}
            </p>

            <div className="p-5 bg-black/40 border border-white/15 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#F2EDE4]/70">
                <BookOpen className="w-4 h-4 text-[#C084FC]" />
                <span>Esta obra aún no tiene un manuscrito o documento PDF adjunto.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StarsBackground>
  );
}
