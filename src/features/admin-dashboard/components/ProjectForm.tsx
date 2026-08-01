'use client';

import { useState, useActionState } from 'react';
import Image from 'next/image';
import { Upload, Loader2 } from 'lucide-react';
import { createProjectAction, type ActionResponse } from '../actions/project.actions';

const initialState: ActionResponse = {
  error: null,
};

export function ProjectForm() {
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    initialState
  );

  const [preview, setPreview] = useState<string | null>(null);
  const [docType, setDocType] = useState<'none' | 'pdf' | 'markdown'>('none');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <div className="w-full bg-[#160E0A] border border-white/15 rounded-2xl p-6 md:p-10 shadow-2xl font-mono">
      {state?.error && (
        <div className="mb-6 p-4 bg-[#7A1220]/30 border border-[#7A1220] rounded-xl text-[#F2EDE4] text-xs font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7A1220] animate-ping" />
          {state.error}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-6">
        {/* Cover Image Upload */}
        <div>
          <label className="block mb-2 text-xs font-bold text-white uppercase tracking-wider">
            Imagen de Portada / Miniatura <span className="text-[#8B2FE0]">*</span>
          </label>
          <div className="relative w-full h-60 bg-black/60 border-2 border-dashed border-white/20 rounded-xl hover:border-[#8B2FE0] transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer group">
            <input
              type="file"
              name="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {preview ? (
              <>
                <Image
                  src={preview}
                  alt="Vista previa"
                  fill
                  className="object-cover opacity-75 group-hover:opacity-40 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="bg-black/90 text-white text-xs px-4 py-2 rounded-lg border border-white/20 font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4" /> CAMBIAR PORTADA
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center pointer-events-none p-4 text-center">
                <div className="w-14 h-14 bg-[#8B2FE0]/20 rounded-full flex items-center justify-center mb-3 text-[#C084FC] border border-[#8B2FE0]/40 group-hover:scale-110 transition-all">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-white text-xs font-bold uppercase tracking-wider mb-1">
                  Arrastra o haz clic para subir la portada
                </span>
                <span className="text-[10px] text-[#F2EDE4]/60">
                  Formatos soportados: JPG, PNG, WebP (Máx. 5MB)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Title and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
              Título de la Obra <span className="text-[#8B2FE0]">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:outline-none focus:ring-2 focus:ring-[#8B2FE0]/30 transition-all text-xs font-mono"
              placeholder="Ej: SomaCore App, Umbral, The Pale Veil"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
              Categoría ESTRATO <span className="text-[#8B2FE0]">*</span>
            </label>
            <select
              name="category"
              defaultValue="apps-software"
              className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:outline-none focus:ring-2 focus:ring-[#8B2FE0]/30 transition-all appearance-none text-xs font-mono font-bold"
            >
              <option value="apps-software" className="bg-[#0D0A08]">Apps &amp; BioTech (apps-software)</option>
              <option value="manga" className="bg-[#0D0A08]">Manga &amp; Cómics</option>
              <option value="anime" className="bg-[#0D0A08]">Anime &amp; Animación</option>
              <option value="visual-novel" className="bg-[#0D0A08]">Visual Novel</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
            Estado de Publicación <span className="text-[#8B2FE0]">*</span>
          </label>
          <input
            type="text"
            name="status"
            defaultValue="En Emisión"
            placeholder="Ej: En Emisión, En Producción, En Desarrollo, Completado"
            required
            className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:outline-none focus:ring-2 focus:ring-[#8B2FE0]/30 transition-all text-xs font-mono"
          />
        </div>

        {/* Document Format Selection */}
        <div className="p-5 bg-black/40 border border-white/15 rounded-xl">
          <label className="block mb-3 text-xs font-bold text-white uppercase tracking-wider">
            📄 Formato de Lectura de Documento
          </label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setDocType('none')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                docType === 'none'
                  ? 'bg-[#8B2FE0] text-white border-[#8B2FE0]'
                  : 'bg-black/60 text-[#F2EDE4]/60 border-white/10 hover:border-white/30'
              }`}
            >
              🚫 Sin Documento
            </button>
            <button
              type="button"
              onClick={() => setDocType('pdf')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                docType === 'pdf'
                  ? 'bg-[#8B2FE0] text-white border-[#8B2FE0]'
                  : 'bg-black/60 text-[#F2EDE4]/60 border-white/10 hover:border-white/30'
              }`}
            >
              📄 Documento PDF
            </button>
            <button
              type="button"
              onClick={() => setDocType('markdown')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                docType === 'markdown'
                  ? 'bg-[#8B2FE0] text-white border-[#8B2FE0]'
                  : 'bg-black/60 text-[#F2EDE4]/60 border-white/10 hover:border-white/30'
              }`}
            >
              📖 Markdown (Obsidian)
            </button>
          </div>

          <input type="hidden" name="file_type" value={docType === 'none' ? '' : docType} />

          {docType === 'pdf' && (
            <div className="pt-2">
              <label className="block mb-2 text-xs font-bold text-[#C084FC] uppercase tracking-wider">
                Adjuntar Archivo PDF (.pdf)
              </label>
              <input
                type="file"
                name="doc_file"
                accept=".pdf,application/pdf"
                className="w-full p-3 border border-white/20 bg-black/80 text-white rounded-xl text-xs font-mono cursor-pointer"
              />
            </div>
          )}

          {docType === 'markdown' && (
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <label className="block mb-2 text-xs font-bold text-[#C084FC] uppercase tracking-wider">
                  Opción A: Adjuntar Archivo Markdown (.md)
                </label>
                <input
                  type="file"
                  name="doc_file"
                  accept=".md,.markdown,text/markdown"
                  className="w-full p-3 border border-white/20 bg-black/80 text-white rounded-xl text-xs font-mono cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-bold text-[#C084FC] uppercase tracking-wider">
                  Opción B: Pegar Sintaxis Markdown / Obsidian Directamente
                </label>
                <textarea
                  name="markdown_content"
                  rows={8}
                  placeholder={`---
title: "Capítulo 1: El Regreso a Casa"
bgm: "audio/bgm_capitulo1.mp3"
---

**Elena:** "Debemos cruzar el valle antes de que se ponga el sol."

> [!thought] Monólogo Interno
> *¿Y si estamos caminando hacia una trampa?*

[Peligro inmimete]{color: blood}
`}
                  className="w-full p-3.5 border border-white/20 bg-black/80 text-white rounded-xl focus:border-[#8B2FE0] focus:outline-none focus:ring-2 focus:ring-[#8B2FE0]/30 transition-all font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
            Sinopsis / Resumen Técnico <span className="text-[#8B2FE0]">*</span>
          </label>
          <textarea
            name="description"
            rows={4}
            required
            placeholder="Describe el concepto, sinopsis o ficha técnica de la obra..."
            className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:outline-none focus:ring-2 focus:ring-[#8B2FE0]/30 transition-all resize-none text-xs leading-relaxed font-sans"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-white/10 mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold px-8 py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> PROCESANDO REGISTRO...
              </>
            ) : (
              'PUBLICAR EN CATÁLOGO →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
