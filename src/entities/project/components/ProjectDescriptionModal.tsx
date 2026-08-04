'use client';

// Modal reutilizable de "ficha técnica y descripción completa" — antes vivía
// duplicado dentro de ProjectList.tsx (admin) con un botón de cerrar de baja
// visibilidad (p-1, sin fondo). Ahora es un componente compartido en la capa
// entities/project para que tanto el admin (ProjectList) como los lectores
// públicos (DocumentReaderContainer, vía ProjectDescriptionButton) usen el
// mismo modal con el mismo botón de cerrar bien visible (estilo tomado de
// MediaFormatModal: p-2, fondo blanco/5, rounded-xl).
import type { ReactNode } from 'react';
import Image from 'next/image';
import { Info, X } from 'lucide-react';

export interface ProjectDescriptionModalProps {
  title: string;
  description: string;
  imageUrl?: string | null;
  category?: string;
  status?: string;
  isOpen: boolean;
  onClose: () => void;
  /** Slot opcional para acciones extra (ej. el admin agrega "LEER OBRA AHORA" + ID de registro). */
  footer?: ReactNode;
}

export function ProjectDescriptionModal({
  title,
  description,
  imageUrl,
  category,
  status,
  isOpen,
  onClose,
  footer,
}: ProjectDescriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-mono"
      onClick={onClose}
    >
      <div
        className="bg-[#120A08] border border-[#8B2FE0] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-[#C084FC]" /> FICHA TÉCNICA Y DESCRIPCIÓN COMPLETA
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#F2EDE4]/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer shrink-0"
            aria-label="Cerrar ficha técnica"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex gap-4 items-center">
            {imageUrl && (
              <div className="relative w-20 h-28 rounded-xl overflow-hidden border border-white/20 shrink-0">
                <Image src={imageUrl} alt={title} fill className="object-cover" />
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <h3 className="text-white text-base font-black uppercase">{title}</h3>
              {(category || status) && (
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {category && (
                    <span className="px-2 py-0.5 bg-[#8B2FE0]/30 text-[#C084FC] rounded border border-[#8B2FE0]/50 uppercase font-bold">
                      {category}
                    </span>
                  )}
                  {status && (
                    <span className="px-2 py-0.5 bg-[#7ED957]/30 text-[#7ED957] rounded border border-[#7ED957]/50 font-bold">
                      {status}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-2 max-h-[50vh] overflow-y-auto">
            <span className="text-[#C084FC] text-[11px] font-bold block uppercase">Sinopsis / Descripción completa:</span>
            <p className="font-sans text-xs text-[#F2EDE4]/90 leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </div>

          {footer}
        </div>
      </div>
    </div>
  );
}
