'use client';

// Editor de lista para las URLs de la galería de ilustraciones. Reemplaza el
// textarea plano (una URL por línea, sin forma de distinguir dónde termina
// una y empieza otra) por filas individuales con miniatura de vista previa,
// y controles de añadir/quitar/reordenar. Serializa de vuelta a un string
// unido por '\n' vía un <input type="hidden">, así project.actions.ts no
// necesita ningún cambio (sigue haciendo formData.get('gallery_urls').split('\n')).
//
// Controlado hacia afuera (recibe value/onChange) pero con estado interno
// propio (rows) para el detalle de las filas — necesario porque el string
// serializado ('\n'.join) es AMBIGUO: 0 filas y 1 fila vacía ambos son "".
// Si derivásemos `rows` directamente de `value` en cada render, agregar la
// primera fila vacía haría `[''].join('\n') === ''`, el mismo valor que ya
// había, así que React no detectaría cambio y el botón "parecería" no hacer
// nada. Por eso `rows` vive en useState y solo se resincroniza desde `value`
// cuando ese valor llega de AFUERA (otra obra seleccionada, carga asíncrona
// del useEffect de precarga en ProjectForm) — se detecta comparando contra
// el último valor que este mismo componente emitió (lastEmitted).
import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ImageOff, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export interface GalleryUrlsEditorProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  accentColor?: string;
}

function parseValue(value: string): string[] {
  return value === '' ? [] : value.split('\n');
}

export function GalleryUrlsEditor({ name, value, onChange, accentColor = '#8B2FE0' }: GalleryUrlsEditorProps) {
  const idBase = useId();
  const [urls, setUrls] = useState<string[]>(() => parseValue(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setUrls(parseValue(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const commit = (next: string[]) => {
    setUrls(next);
    const serialized = next.join('\n');
    lastEmitted.current = serialized;
    onChange(serialized);
  };

  const updateUrl = (index: number, newUrl: string) => {
    commit(urls.map((u, i) => (i === index ? newUrl : u)));
  };

  const removeUrl = (index: number) => {
    commit(urls.filter((_, i) => i !== index));
  };

  const addUrl = () => {
    commit([...urls, '']);
  };

  const moveUrl = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= urls.length) return;
    const updated = [...urls];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    commit(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={urls.join('\n')} />

      {urls.length === 0 && (
        <div className="p-4 border border-dashed border-white/15 rounded-xl text-center text-[11px] text-[#F2EDE4]/40">
          Sin imágenes en la galería. Añade la primera URL abajo.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {urls.map((url, index) => (
          <div
            key={`${idBase}-${index}`}
            className="flex items-center gap-2 p-2 bg-black/60 border border-white/15 rounded-xl"
          >
            <span className="shrink-0 w-5 text-center text-[10px] font-bold text-[#F2EDE4]/40">
              {index + 1}
            </span>

            <div className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-white/15 bg-black/80">
              {url ? (
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
              onChange={(e) => updateUrl(index, e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="flex-1 min-w-0 p-2 border border-white/15 bg-black/40 text-white rounded-lg text-xs font-mono"
            />

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => moveUrl(index, -1)}
                disabled={index === 0}
                className="p-1.5 text-[#F2EDE4]/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Mover arriba"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveUrl(index, 1)}
                disabled={index === urls.length - 1}
                className="p-1.5 text-[#F2EDE4]/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Mover abajo"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeUrl(index)}
                className="p-1.5 text-[#7A1220] hover:text-[#ff4d5e] cursor-pointer"
                aria-label="Quitar imagen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addUrl}
        style={{ borderColor: `${accentColor}66`, color: accentColor }}
        className="self-start flex items-center gap-1.5 px-3 py-2 border rounded-lg text-[11px] font-bold hover:bg-white/5 transition-all cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> AÑADIR IMAGEN
      </button>
    </div>
  );
}
