'use client';

import type { Project } from '../types';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Music, 
  Image as ImageIcon, 
  X, 
  ChevronRight,
  Layers
} from 'lucide-react';
import Link from 'next/link';

export interface MediaFormatModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaFormatModal({ project, isOpen, onClose }: MediaFormatModalProps) {
  if (!isOpen) return null;

  const hasMarkdown = Boolean(project.markdown_content || (project.file_type === 'markdown' && !project.document_url));
  const hasPdf = Boolean(project.document_url || project.file_type === 'pdf');
  const hasVideo = Boolean(project.video_url && project.video_url.trim());
  const hasAudio = Boolean(project.audio_url && project.audio_url.trim());
  const hasGallery = Boolean(project.gallery_urls && project.gallery_urls.length > 0);

  const availableFormats = [
    hasMarkdown && {
      id: 'markdown',
      label: 'Manuscrito Markdown / Obsidian',
      sub: 'Lectura interactiva en formato ESTRATO con música y ramas',
      icon: BookOpen,
      color: 'text-[#C084FC]',
      bgColor: 'bg-[#8B2FE0]/20 border-[#8B2FE0]',
      hoverColor: 'hover:bg-[#8B2FE0]/40',
      param: 'markdown',
    },
    hasPdf && {
      id: 'pdf',
      label: 'Documento PDF Oficial',
      sub: 'Visor de documento PDF interactivo con modo pantalla completa',
      icon: FileText,
      color: 'text-[#7ED957]',
      bgColor: 'bg-[#7ED957]/20 border-[#7ED957]',
      hoverColor: 'hover:bg-[#7ED957]/40',
      param: 'pdf',
    },
    hasVideo && {
      id: 'video',
      label: 'Reproductor de Video',
      sub: 'Visualización de video (YouTube / TikTok / Drive / MP4)',
      icon: Video,
      color: 'text-[#FFD700]',
      bgColor: 'bg-[#FFD700]/20 border-[#FFD700]',
      hoverColor: 'hover:bg-[#FFD700]/40',
      param: 'video',
    },
    hasAudio && {
      id: 'audio',
      label: 'Pista de Audio & Soundtrack BGM',
      sub: 'Reproductor de audio y banda sonora original',
      icon: Music,
      color: 'text-[#00BFFF]',
      bgColor: 'bg-[#00BFFF]/20 border-[#00BFFF]',
      hoverColor: 'hover:bg-[#00BFFF]/40',
      param: 'audio',
    },
    hasGallery && {
      id: 'gallery',
      label: 'Galería de Ilustraciones & Arte',
      sub: 'Visor de imágenes en alta resolución con carrusel',
      icon: ImageIcon,
      color: 'text-[#FF69B4]',
      bgColor: 'bg-[#FF69B4]/20 border-[#FF69B4]',
      hoverColor: 'hover:bg-[#FF69B4]/40',
      param: 'gallery',
    },
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    sub: string;
    icon: typeof BookOpen;
    color: string;
    bgColor: string;
    hoverColor: string;
    param: string;
  }>;

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-mono">
      <div className="bg-[#120A08] border border-[#8B2FE0] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#8B2FE0]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 relative z-10">
          <div>
            <span className="text-[10px] text-[#7ED957] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5" /> SELECCIONAR EXPERIENCIA DE FORMATO
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {project.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#F2EDE4]/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Available Formats List */}
        <div className="space-y-3 relative z-10">
          {availableFormats.map((fmt) => {
            const Icon = fmt.icon;
            return (
              <Link
                key={fmt.id}
                href={`/categorias/${project.id}?mode=${fmt.param}`}
                onClick={onClose}
                className={`p-4 rounded-2xl border ${fmt.bgColor} ${fmt.hoverColor} transition-all flex items-center justify-between group cursor-pointer shadow-lg`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-xl bg-black/60 ${fmt.color} border border-white/10 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-xs sm:text-sm font-bold block ${fmt.color}`}>
                      {fmt.label}
                    </span>
                    <span className="text-[11px] text-[#F2EDE4]/70 block mt-0.5">
                      {fmt.sub}
                    </span>
                  </div>
                </div>

                <ChevronRight className={`w-5 h-5 ${fmt.color} group-hover:translate-x-1 transition-transform shrink-0`} />
              </Link>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 text-center relative z-10">
          <span className="text-[11px] text-[#F2EDE4]/50">
            Wiener Hound Studios &bull; Experiencia Multi-Formato ESTRATO
          </span>
        </div>
      </div>
    </div>
  );
}
