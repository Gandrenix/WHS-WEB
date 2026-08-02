'use client';

import { useState, useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  BookOpen, 
  Edit3, 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Loader2, 
  Info, 
  Eye 
} from 'lucide-react';
import type { Project } from '@/entities/project';
import { MediaBadges } from '@/entities/project/components/MediaBadges';
import { updateCoverImageAction, type ActionResponse } from '../actions/project.actions';

export interface ProjectListProps {
  projects: Project[];
}

const initialState: ActionResponse = {
  error: null,
};

export function ProjectList({ projects }: ProjectListProps) {
  const [coverModalProjectId, setCoverModalProjectId] = useState<string | null>(null);
  const [summaryModalProject, setSummaryModalProject] = useState<Project | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [coverState, coverFormAction, isCoverPending] = useActionState(
    updateCoverImageAction,
    initialState
  );

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

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
    <div className="space-y-6 font-mono">
      {/* Quick Actions Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => {
          const cat = project.category.toLowerCase();
          const categoryBadgeColor =
            cat === 'apps' || cat === 'app' || cat === 'apps-software'
              ? 'bg-[#7ED957]/20 text-[#7ED957] border-[#7ED957]/50'
              : cat === 'manga'
              ? 'bg-[#8B2FE0]/20 text-[#C084FC] border-[#8B2FE0]/50'
              : cat === 'anime'
              ? 'bg-[#7ED957]/20 text-[#7ED957] border-[#7ED957]/50'
              : 'bg-[#C084FC]/20 text-[#C084FC] border-[#C084FC]/50';

          return (
            <div
              key={project.id}
              className="bg-[#160E0A] border border-white/15 rounded-2xl overflow-hidden hover:border-[#8B2FE0] transition-all group flex flex-col shadow-xl relative"
            >
              {/* Cover Preview Image */}
              <div className="h-48 w-full bg-black/60 relative border-b border-white/10 group">
                {project.image_url ? (
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#F2EDE4]/50 text-xs gap-2">
                    <ImageIcon className="w-8 h-8 text-white/30" />
                    <span>Sin Portada</span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`backdrop-blur-md border text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider font-bold ${categoryBadgeColor}`}
                  >
                    {project.category}
                  </span>
                </div>

                {/* Quick Cover Change Button overlay */}
                <button
                  type="button"
                  onClick={() => {
                    setCoverModalProjectId(project.id);
                    setCoverPreview(project.image_url || null);
                  }}
                  className="absolute bottom-3 right-3 bg-black/80 hover:bg-[#8B2FE0] text-white p-2 rounded-xl text-xs font-bold transition-all border border-white/20 shadow-lg flex items-center gap-1.5 cursor-pointer opacity-90 group-hover:opacity-100"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">CAMBIAR PORTADA</span>
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3
                    className="font-mono font-black text-lg text-white mb-2 line-clamp-1 uppercase tracking-tight"
                    title={project.title}
                  >
                    {project.title}
                  </h3>
                  <p className="font-sans text-xs text-[#F2EDE4]/80 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Card Footer Status & Quick Actions Bar */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2.5 py-1 rounded-md font-bold bg-[#7ED957]/20 text-[#7ED957] border border-[#7ED957]/40 text-[10px]">
                      ● {project.status}
                    </span>
                    <MediaBadges project={project} />
                  </div>

                  {/* 4 Quick Action Buttons Grid */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                    {/* Read Work */}
                    <Link
                      href={`/categorias/${project.id}`}
                      target="_blank"
                      className="p-2.5 bg-[#8B2FE0]/20 hover:bg-[#8B2FE0] text-[#C084FC] hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1 border border-[#8B2FE0]/40 text-center"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>LEER</span>
                    </Link>

                    {/* View Summary / Ficha */}
                    <button
                      type="button"
                      onClick={() => setSummaryModalProject(project)}
                      className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1 border border-white/20 text-center cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>RESUMEN</span>
                    </button>

                    {/* Edit in CMS Studio */}
                    <Link
                      href={`/admin/dashboard/nuevo?project_id=${project.id}&mode=edit`}
                      className="p-2.5 bg-[#7ED957]/20 hover:bg-[#7ED957] text-[#7ED957] hover:text-[#0D0A08] rounded-xl font-bold transition-all flex items-center justify-center gap-1 border border-[#7ED957]/40 text-center"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>EDITAR</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK COVER CHANGE MODAL */}
      {coverModalProjectId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#120A08] border border-[#8B2FE0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#C084FC]" /> CAMBIAR PORTADA DE LA OBRA
              </span>
              <button
                type="button"
                onClick={() => {
                  setCoverModalProjectId(null);
                  setCoverPreview(null);
                }}
                className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {coverState?.error && (
              <div className="p-3 bg-[#7A1220]/40 border border-[#7A1220] rounded-xl text-white text-xs font-bold">
                {coverState.error}
              </div>
            )}

            <form action={coverFormAction} className="space-y-4">
              <input type="hidden" name="target_project_id" value={coverModalProjectId} />

              <div className="relative w-full h-56 bg-black/60 border-2 border-dashed border-white/20 rounded-xl overflow-hidden flex flex-col items-center justify-center group cursor-pointer">
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Portada previa"
                    fill
                    className="object-cover opacity-80"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <Upload className="w-8 h-8 text-[#C084FC] mb-2" />
                    <span className="text-white text-xs font-bold">Haz clic para subir la nueva imagen</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCoverModalProjectId(null);
                    setCoverPreview(null);
                  }}
                  className="px-4 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isCoverPending}
                  className="px-6 py-2.5 bg-[#8B2FE0] hover:bg-[#C084FC] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  {isCoverPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ACTUALIZAR PORTADA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUMMARY / FICHA TÉCNICA MODAL */}
      {summaryModalProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#120A08] border border-[#8B2FE0] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C084FC]" /> FICHA TÉCNICA Y RESUMEN DE LA OBRA
              </span>
              <button
                type="button"
                onClick={() => setSummaryModalProject(null)}
                className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex gap-4 items-center">
                {summaryModalProject.image_url && (
                  <div className="relative w-20 h-28 rounded-xl overflow-hidden border border-white/20 shrink-0">
                    <Image
                      src={summaryModalProject.image_url}
                      alt={summaryModalProject.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-white text-base font-black uppercase">{summaryModalProject.title}</h3>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="px-2 py-0.5 bg-[#8B2FE0]/30 text-[#C084FC] rounded border border-[#8B2FE0]/50 uppercase font-bold">
                      {summaryModalProject.category}
                    </span>
                    <span className="px-2 py-0.5 bg-[#7ED957]/30 text-[#7ED957] rounded border border-[#7ED957]/50 font-bold">
                      {summaryModalProject.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-2">
                <span className="text-[#C084FC] text-[11px] font-bold block uppercase">Sinopsis / Descripción:</span>
                <p className="font-sans text-xs text-[#F2EDE4]/90 leading-relaxed">
                  {summaryModalProject.description}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 text-[10px] text-[#F2EDE4]/60">
                <span>ID REGISTRO: {summaryModalProject.id}</span>
                <Link
                  href={`/categorias/${summaryModalProject.id}`}
                  target="_blank"
                  className="px-4 py-2 bg-[#8B2FE0] text-white rounded-xl font-bold flex items-center gap-1.5 text-xs hover:bg-[#C084FC]"
                >
                  <Eye className="w-4 h-4" /> LEER OBRA AHORA &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
