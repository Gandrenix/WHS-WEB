'use client';

// Una fila de GalleryUrlsEditor: input de URL + miniatura + botón de subir desde PC.
// Vive aparte del editor porque cada fila necesita su PROPIO estado de subida (la subida
// de la fila 3 no debe bloquear ni compartir estado con la fila 1) — un hook no puede
// llamarse dentro del .map() del padre, así que la fila entera es su propio componente.
//
// La subida va directo del navegador a Supabase Storage (ver useGalleryImageUpload): sin tope
// de tamaño propio y sin pasar por la app. Antes se llamaba a un Server Action con el archivo
// dentro — fallaba con imágenes grandes (Netlify corta las peticiones de ~6 MB+).
import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp, ImageOff, Loader2, Maximize2, Trash2, Upload, X } from 'lucide-react';
import { useGalleryImageUpload } from '../hooks/useGalleryImageUpload';
import { ImageLightbox } from './ImageLightbox';

/**
 * Los enlaces "para compartir" de Google Drive (y similares: Dropbox `?dl=0`, OneDrive
 * `1drv.ms`) abren un visor HTML, no el archivo crudo — <img src> nunca los puede pintar,
 * sin importar qué tan "público" esté el archivo. No es un bug de esta app: es cómo
 * funcionan esos enlaces. Se detectan para explicarlo en vez de mostrar solo un ícono roto.
 */
function isUnsupportedShareLink(url: string): boolean {
  return /drive\.google\.com|docs\.google\.com|dropbox\.com\/s\/|1drv\.ms/i.test(url);
}

export interface GalleryUrlRowProps {
  index: number;
  url: string;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (index: number, url: string) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}

export function GalleryUrlRow({ index, url, isFirst, isLast, onUpdate, onRemove, onMove }: GalleryUrlRowProps) {
  const idBase = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { upload, isUploading, error, dismissError } = useGalleryImageUpload((publicUrl) => onUpdate(index, publicUrl));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo si la subida falla
    if (file) upload(file);
  };

  const showShareLinkWarning = url && isUnsupportedShareLink(url);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 p-2 bg-black/60 border border-white/15 rounded-xl">
        <span className="shrink-0 w-5 text-center text-[10px] font-bold text-[#F2EDE4]/40">{index + 1}</span>

        <div className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-white/15 bg-black/80">
          {isUploading ? (
            <div className="w-full h-full flex items-center justify-center text-[#8B2FE0]">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : url && !showShareLinkWarning ? (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="group/thumb relative block w-full h-full cursor-zoom-in"
              aria-label={`Ampliar imagen ${index + 1}`}
              title="Ver en grande"
            >
              <Image
                src={url}
                alt={`Miniatura ${index + 1}`}
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100">
                <Maximize2 className="w-4 h-4" />
              </span>
            </button>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#F2EDE4]/20">
              <ImageOff className="w-4 h-4" />
            </div>
          )}
        </div>

        <input
          type="url"
          value={url}
          onChange={(e) => onUpdate(index, e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="flex-1 min-w-0 p-2 border border-white/15 bg-black/40 text-white rounded-lg text-xs font-mono"
        />

        {/* Input de archivo oculto: el botón solo lo abre, la subida real la dispara el
            propio onChange (llamando al Server Action directo, ver arriba). */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Subir imagen desde el equipo"
          className="shrink-0 p-1.5 text-[#F2EDE4]/50 hover:text-[#8B2FE0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Subir imagen desde el equipo"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={isFirst}
            className="p-1.5 text-[#F2EDE4]/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Mover arriba"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={isLast}
            className="p-1.5 text-[#F2EDE4]/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Mover abajo"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-[#7A1220] hover:text-[#ff4d5e] cursor-pointer"
            aria-label="Quitar imagen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showShareLinkWarning && (
        <p className="flex items-start gap-1.5 pl-9 text-[10px] text-amber-400/90 font-sans leading-snug">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          Los enlaces &ldquo;para compartir&rdquo; de Drive/Dropbox no se pueden mostrar como imagen
          (abren un visor, no el archivo). Usa el botón de subir <Upload className="w-2.5 h-2.5 inline" /> en su lugar.
        </p>
      )}
      {isUploading && (
        <p className="flex items-center gap-2 pl-9 text-xs text-[#C084FC]" role="status">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo imagen…
        </p>
      )}
      {error && !isUploading && (
        <div
          role="alert"
          id={`${idBase}-error`}
          className="ml-9 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/50 p-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-semibold leading-snug text-red-100">{error.title}</p>
            {error.hint && <p className="text-xs leading-relaxed text-red-200/80">{error.hint}</p>}
            <details className="text-xs text-red-200/60">
              <summary className="cursor-pointer select-none hover:text-red-100">Detalle técnico</summary>
              <code className="mt-1 block break-words rounded bg-black/40 p-2 font-mono text-[11px] leading-relaxed text-red-100/90">
                {error.detail}
              </code>
            </details>
          </div>
          <button
            type="button"
            onClick={dismissError}
            aria-label="Cerrar aviso"
            className="shrink-0 rounded-md p-1 text-red-200/70 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {zoomOpen && url && <ImageLightbox src={url} alt={`Imagen ${index + 1} de la galería`} onClose={() => setZoomOpen(false)} />}
    </div>
  );
}
