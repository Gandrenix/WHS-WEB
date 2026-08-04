'use client';

// Botón flotante para que el usuario público pueda ver la descripción COMPLETA
// de la obra — antes solo el admin podía verla completa (vía el modal de
// ProjectList), y el público solo veía line-clamp-3 en ProjectCard sin forma
// de expandir. Se posiciona bottom-6 left-6 para no chocar con el botón de
// audio BGM de MarkdownReader (bottom-6 right-6).
import { useState } from 'react';
import { Info } from 'lucide-react';
import { ProjectDescriptionModal } from './ProjectDescriptionModal';

export interface ProjectDescriptionButtonProps {
  title: string;
  description: string;
  imageUrl?: string | null;
  category?: string;
  status?: string;
}

export function ProjectDescriptionButton({
  title,
  description,
  imageUrl,
  category,
  status,
}: ProjectDescriptionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-3.5 bg-[#120A08] hover:bg-[#8B2FE0] text-[#C084FC] hover:text-white rounded-full shadow-2xl transition-all flex items-center gap-2 border border-[#8B2FE0]/60 font-mono text-xs cursor-pointer"
      >
        <Info className="w-5 h-5" />
        <span className="font-bold uppercase tracking-wider hidden sm:inline">DESCRIPCIÓN COMPLETA</span>
      </button>

      <ProjectDescriptionModal
        title={title}
        description={description}
        imageUrl={imageUrl}
        category={category}
        status={status}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
