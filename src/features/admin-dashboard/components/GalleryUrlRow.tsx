'use client';

// Una fila de GalleryUrlsEditor: input de URL + miniatura + botón de subir desde PC.
// Vive aparte del editor porque cada fila necesita su PROPIO useActionState (la subida de
// la fila 3 no debe bloquear ni compartir estado con la fila 1) — un hook no puede llamarse
// dentro del .map() del padre, así que la fila entera es su propio componente.
import { useActionState, useEffect, useId, useRef } from 'react';
import Image from 'next/image';
import { AlertTriangle, ChevronDown, ChevronUp, ImageOff, Loader2, Trash2, Upload } from 'lucide-react';
import { uploadGalleryImageAction, type ImageUploadResponse } from '../actions/project.actions';

const uploadInitialState: ImageUploadResponse = {};

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
  const [state, formAction, isUploading] = useActionState(uploadGalleryImageAction, uploadInitialState);

  // useActionState no avisa "esta subida es para la fila 2 y no la 5": cada fila tiene su
  // propia instancia del hook (por eso este componente existe), así que un `state.url`
  // nuevo siempre es el de ESTA fila.
  useEffect(() => {
    if (state.url) onUpdate(index, state.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.url]);

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

        {/* Subida directa: el <form> solo existe para que useActionState tenga a quién
            engancharse — el input de archivo dispara el submit solo, sin botón "enviar". */}
        <form action={formAction} className="contents">
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) e.target.form?.requestSubmit();
            }}
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
        </form>

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
      {state.error && !isUploading && (
        <p className="pl-9 text-[10px] text-[#ff8a95] font-sans" id={`${idBase}-error`}>
          {state.error}
        </p>
      )}
    </div>
  );
}
