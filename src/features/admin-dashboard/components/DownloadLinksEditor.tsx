'use client';

// Editor de lista para los enlaces externos de descarga (ej. Google Drive)
// que el admin puede adjuntar a una obra. Mismo patrón controlado que
// GalleryUrlsEditor.tsx (value/onChange como string serializado + estado
// interno propio con resincronización vía lastEmitted), pero cada fila tiene
// DOS campos (etiqueta + URL) en vez de uno, así que la serialización usa
// JSON.stringify en vez de join('\n'). El <input type="hidden"> serializado
// es lo que project.actions.ts parsea con JSON.parse(formData.get(name)).
import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Plus, Trash2 } from 'lucide-react';

export interface DownloadLinkRow {
  label: string;
  url: string;
}

export interface DownloadLinksEditorProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

function parseValue(value: string): DownloadLinkRow[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.url === 'string')
      .map((item) => ({ label: String(item.label || ''), url: String(item.url) }));
  } catch {
    return [];
  }
}

export function DownloadLinksEditor({ name, value, onChange }: DownloadLinksEditorProps) {
  const idBase = useId();
  const [links, setLinks] = useState<DownloadLinkRow[]>(() => parseValue(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setLinks(parseValue(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const commit = (next: DownloadLinkRow[]) => {
    setLinks(next);
    const serialized = JSON.stringify(next);
    lastEmitted.current = serialized;
    onChange(serialized);
  };

  const updateLink = (index: number, patch: Partial<DownloadLinkRow>) => {
    commit(links.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  };

  const removeLink = (index: number) => commit(links.filter((_, i) => i !== index));
  const addLink = () => commit([...links, { label: '', url: '' }]);

  const moveLink = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(links)} />

      {links.length === 0 && (
        <div className="p-4 border border-dashed border-white/15 rounded-xl text-center text-[11px] text-[#F2EDE4]/40">
          Sin enlaces de descarga. Añade el primero abajo (ej. Google Drive).
        </div>
      )}

      <div className="flex flex-col gap-2">
        {links.map((link, index) => (
          <div
            key={`${idBase}-${index}`}
            className="flex items-start gap-2 p-3 bg-black/60 border border-white/15 rounded-xl"
          >
            <span className="shrink-0 w-5 text-center text-[10px] font-bold text-[#F2EDE4]/40 pt-2.5">
              {index + 1}
            </span>

            <div className="flex-1 min-w-0 space-y-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(index, { label: e.target.value })}
                placeholder="Etiqueta (ej. Descargar guión completo)"
                className="w-full p-2 border border-white/15 bg-black/40 text-white rounded-lg text-xs font-mono focus:border-[#7ED957] focus:outline-none"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(index, { url: e.target.value })}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full p-2 border border-white/15 bg-black/40 text-white rounded-lg text-xs font-mono focus:border-[#7ED957] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-0.5 shrink-0 pt-1">
              <button
                type="button"
                onClick={() => moveLink(index, -1)}
                disabled={index === 0}
                className="p-1.5 text-[#F2EDE4]/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Mover arriba"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveLink(index, 1)}
                disabled={index === links.length - 1}
                className="p-1.5 text-[#F2EDE4]/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Mover abajo"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="p-1.5 text-[#7A1220] hover:text-[#ff4d5e] cursor-pointer"
                aria-label="Quitar enlace"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addLink}
        className="self-start flex items-center gap-1.5 px-3 py-2 border rounded-lg text-[11px] font-bold hover:bg-white/5 transition-all cursor-pointer border-[#7ED957]/60 text-[#7ED957]"
      >
        <Download className="w-3.5 h-3.5" /> AÑADIR ENLACE DE DESCARGA
      </button>
    </div>
  );
}
