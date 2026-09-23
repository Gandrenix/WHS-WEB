'use client';

// Editor de lista para las URLs de la galería de ilustraciones. Reemplaza el
// textarea plano (una URL por línea, sin forma de distinguir dónde termina
// una y empieza otra) por filas individuales (GalleryUrlRow) con miniatura de
// vista previa, botón de subir desde el equipo, y controles de
// añadir/quitar/reordenar. Serializa de vuelta a un string unido por '\n' vía
// un <input type="hidden">, así project.actions.ts no necesita ningún cambio
// (sigue haciendo formData.get('gallery_urls').split('\n')).
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
//
// Cada fila lleva un `id` propio (no el índice) para usar como key de React:
// GalleryUrlRow tiene su PROPIO estado de subida (useGalleryImageUpload), y con
// key={índice} reordenar filas (los botones subir/bajar) haría que React
// reutilice el componente de una posición para OTRA fila — un spinner de
// subida en curso "saltaría" a la fila equivocada en vez de seguir a su URL.
import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { GalleryUrlRow } from './GalleryUrlRow';

export interface GalleryUrlsEditorProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  accentColor?: string;
}

interface Row {
  id: number;
  url: string;
}

// Contador a nivel de módulo (no un ref del componente): solo sirve para que cada fila
// tenga una key de React estable entre reordenamientos, no necesita aislarse por
// instancia — y evita el problema de leer un ref durante el render (el lazy initializer
// de useState corre en render).
let idSeq = 0;
const nextId = () => idSeq++;

function parseValue(value: string): Row[] {
  if (value === '') return [];
  return value.split('\n').map((url) => ({ id: nextId(), url }));
}

export function GalleryUrlsEditor({ name, value, onChange, accentColor = '#8B2FE0' }: GalleryUrlsEditorProps) {
  const [rows, setRows] = useState<Row[]>(() => parseValue(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setRows(parseValue(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const commit = (next: Row[]) => {
    setRows(next);
    const serialized = next.map((r) => r.url).join('\n');
    lastEmitted.current = serialized;
    onChange(serialized);
  };

  const updateUrl = (index: number, newUrl: string) => {
    commit(rows.map((r, i) => (i === index ? { ...r, url: newUrl } : r)));
  };

  const removeUrl = (index: number) => {
    commit(rows.filter((_, i) => i !== index));
  };

  const addUrl = () => {
    commit([...rows, { id: nextId(), url: '' }]);
  };

  const moveUrl = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const updated = [...rows];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    commit(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={rows.map((r) => r.url).join('\n')} />

      {rows.length === 0 && (
        <div className="p-4 border border-dashed border-white/15 rounded-xl text-center text-[11px] text-[#F2EDE4]/40">
          Sin imágenes en la galería. Añade la primera abajo (pega una URL o súbela desde tu equipo).
        </div>
      )}

      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <GalleryUrlRow
            key={row.id}
            index={index}
            url={row.url}
            isFirst={index === 0}
            isLast={index === rows.length - 1}
            onUpdate={updateUrl}
            onRemove={removeUrl}
            onMove={moveUrl}
          />
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
