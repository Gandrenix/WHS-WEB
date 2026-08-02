'use client';

import { useState, useRef } from 'react';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownReader } from './MarkdownReader';
import { Sparkles, BookOpen, MessageSquare, Palette, ShieldAlert } from 'lucide-react';

export interface MarkdownEditorWithPreviewProps {
  initialValue?: string;
  name?: string;
  onChange?: (value: string) => void;
}

export function MarkdownEditorWithPreview({
  initialValue = '',
  name = 'markdown_content',
  onChange,
}: MarkdownEditorWithPreviewProps) {
  const [content, setContent] = useState(initialValue);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (onChange) onChange(val);
  };

  const handleInsertSnippet = (snippet: string) => {
    if (!textareaRef.current) {
      const updated = content + snippet;
      setContent(updated);
      if (onChange) onChange(updated);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = content.substring(0, start);
    const textAfter = content.substring(end);

    const updated = textBefore + snippet + textAfter;
    setContent(updated);
    if (onChange) onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  return (
    <div className="w-full bg-[#160E0A] border border-white/20 rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Interactive Toolbar */}
      <MarkdownToolbar
        onInsert={handleInsertSnippet}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showCheatsheet={showCheatsheet}
        toggleCheatsheet={() => setShowCheatsheet(!showCheatsheet)}
      />

      {/* Accordion Cheatsheet Panel */}
      {showCheatsheet && (
        <div className="p-4 bg-black/90 border-b border-[#8B2FE0]/40 font-mono text-xs text-[#F2EDE4]/90 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-[#C084FC] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> GUÍA RÁPIDA DE SINTAXIS NARRATIVA (SISTEMA ESTRATO)
            </span>
            <button
              type="button"
              onClick={() => setShowCheatsheet(false)}
              className="text-[#F2EDE4]/50 hover:text-white text-xs cursor-pointer font-bold"
            >
              [CERRAR ✕]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed">
            <div className="p-3 bg-[#120A08] border border-white/10 rounded-xl space-y-1">
              <span className="font-bold text-[#C084FC] flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> 1. Diálogos y Personajes
              </span>
              <p className="text-[#F2EDE4]/70">
                Sintaxis abreviada: <code className="text-[#7ED957]">**Elena:** &quot;Hola&quot;</code><br />
                Tag avanzado: <code className="text-[#7ED957]">&lt;speech speaker=&quot;Marcus&quot; color=&quot;#8B2FE0&quot;&gt;—Texto&lt;/speech&gt;</code>
              </p>
            </div>

            <div className="p-3 bg-[#120A08] border border-white/10 rounded-xl space-y-1">
              <span className="font-bold text-[#FFD700] flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> 2. Callouts y Códices
              </span>
              <p className="text-[#F2EDE4]/70">
                Lore/Códice: <code className="text-[#FFD700]">&gt; [!lore] Título</code><br />
                Pensamiento: <code className="text-[#7ED957]">&gt; [!thought] Título</code><br />
                Nota: <code className="text-[#C084FC]">&gt; [!note] Título</code>
              </p>
            </div>

            <div className="p-3 bg-[#120A08] border border-white/10 rounded-xl space-y-1">
              <span className="font-bold text-[#DC143C] flex items-center gap-1">
                <Palette className="w-3 h-3" /> 3. Colores y Efectos
              </span>
              <p className="text-[#F2EDE4]/70">
                Colores: <code className="text-[#FFD700]">[Texto]{'{color: hero}'}</code> o <code className="text-[#DC143C]">{'{color: blood}'}</code><br />
                Neón/Brillo: <code className="text-[#00BFFF]">[Luz]{'{glow: cyan}'}</code><br />
                Temblor: <code className="text-[#DC143C]">[Terremoto]{'{effect: shake}'}</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Editor & Preview Workspace Container */}
      <div className="min-h-[420px] max-h-[700px] flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/15">
        {/* Left / Full: Markdown Textarea Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full'} flex flex-col`}>
            <div className="px-4 py-2 bg-black/40 border-b border-white/10 text-[11px] font-mono font-bold text-[#F2EDE4]/60 uppercase tracking-wider flex justify-between items-center">
              <span>SINTAXIS MARKDOWN / OBSIDIAN</span>
              <span>{content.length} CARACTERES</span>
            </div>
            <textarea
              ref={textareaRef}
              name={name}
              value={content}
              onChange={handleTextChange}
              placeholder={`---
title: "Capítulo 1: El Regreso a Casa"
bgm: "audio/bgm_capitulo1.mp3"
---

**Elena:** "Debemos cruzar el valle antes de que se ponga el sol."

> [!thought] Monólogo Interno
> *¿Y si estamos caminando hacia una trampa?*

[Peligro inminente]{color: blood}
`}
              className="w-full h-full min-h-[380px] p-4 bg-[#0D0A08] text-white focus:outline-none font-mono text-xs leading-relaxed resize-none selection:bg-[#8B2FE0]/40"
            />
          </div>
        )}

        {/* Right / Full: Real-Time Rendered Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full'} bg-[#0D0A08]/90 overflow-y-auto max-h-[700px]`}>
            <div className="px-4 py-2 bg-[#8B2FE0]/20 border-b border-[#8B2FE0]/40 text-[11px] font-mono font-bold text-[#C084FC] uppercase tracking-wider flex items-center gap-2 sticky top-0 z-20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#C084FC] animate-ping" />
              <span>RENDERIZADO EN TIEMPO REAL (VISTA DEL LECTOR)</span>
            </div>
            <div className="p-4 sm:p-6">
              {content.trim() ? (
                <MarkdownReader content={content} />
              ) : (
                <div className="p-12 text-center text-[#F2EDE4]/40 font-mono text-xs border-2 border-dashed border-white/10 rounded-2xl my-8">
                  <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-40 text-[#8B2FE0]" />
                  Escribe o inserta contenido en el editor para visualizar la vista inmersiva del lector en tiempo real.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
