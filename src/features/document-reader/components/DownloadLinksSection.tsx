// Zona de descarga pública — muestra los enlaces externos (ej. Google Drive)
// que el admin adjuntó a la obra desde ProjectForm (DownloadLinksEditor).
// Convierte automáticamente enlaces "de vista" de Google Drive a su URL de
// descarga directa (uc?export=download), para que el clic dispare la
// descarga del archivo en vez de abrir el visor de Drive.
import { Download, ExternalLink } from 'lucide-react';
import type { DownloadLink } from '@/entities/project';

export interface DownloadLinksSectionProps {
  links?: DownloadLink[] | null;
}

function resolveDownloadUrl(url: string): string {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  }
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
  }
  return url;
}

// Solo la tarjeta en sí, sin padding/max-w externo: cada punto de uso decide
// su propio wrapper de layout (igual que generalComments en
// DocumentReaderContainer, que tampoco trae su propio padding — así este
// componente sirve tanto suelto entre secciones como anidado dentro de otra
// tarjeta ya paddeada, ej. el modo "ficha técnica").
export function DownloadLinksSection({ links }: DownloadLinksSectionProps) {
  const validLinks = (links || []).filter((link) => link.url?.trim());
  if (validLinks.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#7ED957]/30 bg-[#7ED957]/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-[#7ED957]" />
        <h3 className="font-mono text-sm font-black uppercase tracking-wide text-white">
          Recursos para Descargar
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {validLinks.map((link, index) => (
          <a
            key={`${link.url}-${index}`}
            href={resolveDownloadUrl(link.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-3 p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#7ED957]/50 hover:bg-[#7ED957]/10 transition-all"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-lg bg-[#7ED957]/15 border border-[#7ED957]/30 flex items-center justify-center shrink-0 text-[#7ED957] group-hover:bg-[#7ED957] group-hover:text-[#0D0A08] transition-all">
                <Download className="w-4 h-4" />
              </span>
              <span className="font-mono text-xs font-bold text-white truncate">
                {link.label?.trim() || 'Descargar archivo'}
              </span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#F2EDE4]/40 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
