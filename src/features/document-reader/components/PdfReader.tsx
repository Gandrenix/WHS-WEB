'use client';

import { useState } from 'react';
import { Download, Maximize, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export interface PdfReaderProps {
  documentUrl: string;
  title: string;
}

export function PdfReader({ documentUrl, title }: PdfReaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#0D0A08] text-[#F2EDE4] flex flex-col font-mono">
      {/* PDF Header Toolbar */}
      <header className="bg-[#120A08] border-b border-white/15 px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-3">
          <Link
            href="/categorias"
            className="p-2 bg-black/60 hover:bg-[#8B2FE0] text-white rounded-lg border border-white/20 transition-all text-xs flex items-center gap-1 font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> VOLVER
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#7ED957]" />
            <h1 className="text-white text-sm sm:text-base font-black uppercase tracking-tight truncate max-w-md">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={documentUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#8B2FE0] hover:bg-[#C084FC] text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> DESCARGAR PDF
          </a>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-black/60 hover:bg-white/10 text-white rounded-xl border border-white/20 transition-all text-xs cursor-pointer"
            title="Pantalla Completa"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* PDF Main Viewer Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 flex flex-col items-center">
        <div
          className={`w-full bg-[#160E0A] border border-white/15 rounded-2xl overflow-hidden shadow-2xl transition-all ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen border-none' : 'h-[800px]'
          }`}
        >
          <iframe
            src={`${documentUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-none"
            title={title}
          />
        </div>
      </main>
    </div>
  );
}
