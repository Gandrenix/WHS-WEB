'use client';

import { 
  MessageSquare, 
  BookOpen, 
  Sparkles, 
  Palette, 
  Zap, 
  HelpCircle, 
  SplitSquareVertical, 
  Eye, 
  Edit3,
  Flame,
  AlertTriangle
} from 'lucide-react';

export interface MarkdownToolbarProps {
  onInsert: (snippet: string) => void;
  viewMode: 'edit' | 'preview' | 'split';
  setViewMode: (mode: 'edit' | 'preview' | 'split') => void;
  toggleCheatsheet: () => void;
  showCheatsheet: boolean;
}

export function MarkdownToolbar({
  onInsert,
  viewMode,
  setViewMode,
  toggleCheatsheet,
  showCheatsheet,
}: MarkdownToolbarProps) {
  return (
    <div className="bg-[#120A08] border-b border-white/15 p-2 flex flex-wrap items-center justify-between gap-2 rounded-t-xl select-none font-mono text-xs">
      {/* View Mode Switches */}
      <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10">
        <button
          type="button"
          onClick={() => setViewMode('edit')}
          className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'edit'
              ? 'bg-[#8B2FE0] text-white shadow-md'
              : 'text-[#F2EDE4]/70 hover:text-white hover:bg-white/5'
          }`}
          title="Solo Editor"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">EDITOR</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('split')}
          className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'split'
              ? 'bg-[#8B2FE0] text-white shadow-md'
              : 'text-[#F2EDE4]/70 hover:text-white hover:bg-white/5'
          }`}
          title="Vista Dividida (Split)"
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">DIVIDIDA</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('preview')}
          className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'preview'
              ? 'bg-[#8B2FE0] text-white shadow-md'
              : 'text-[#F2EDE4]/70 hover:text-white hover:bg-white/5'
          }`}
          title="Solo Vista Previa"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">VISTA PREVIA</span>
        </button>
      </div>

      {/* Quick Snippet Insertion Buttons */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Diálogo */}
        <button
          type="button"
          onClick={() => onInsert('<speech speaker="Elena" color="#8B2FE0">\n— No permitiré que este pueblo sufra el mismo destino.\n</speech>\n\n')}
          className="px-2.5 py-1 rounded bg-[#8B2FE0]/20 hover:bg-[#8B2FE0]/40 text-[#C084FC] border border-[#8B2FE0]/40 flex items-center gap-1 transition-all cursor-pointer font-bold"
          title="Insertar Globo de Diálogo"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Diálogo</span>
        </button>

        {/* Callout Lore */}
        <button
          type="button"
          onClick={() => onInsert('> [!lore] Códice del Sistema\n> Artefacto forjado en las profundidades del estrato.\n\n')}
          className="px-2.5 py-1 rounded bg-[#FFD700]/15 hover:bg-[#FFD700]/30 text-[#FFD700] border border-[#FFD700]/30 flex items-center gap-1 transition-all cursor-pointer font-bold"
          title="Insertar Códice / Lore"
        >
          <BookOpen className="w-3 h-3" />
          <span>Lore</span>
        </button>

        {/* Callout Monólogo */}
        <button
          type="button"
          onClick={() => onInsert('> [!thought] Monólogo Interno\n> *¿Y si estamos caminando directamente hacia una trampa?*\n\n')}
          className="px-2.5 py-1 rounded bg-[#7ED957]/15 hover:bg-[#7ED957]/30 text-[#7ED957] border border-[#7ED957]/30 flex items-center gap-1 transition-all cursor-pointer font-bold"
          title="Insertar Monólogo Interno"
        >
          <Sparkles className="w-3 h-3" />
          <span>Pensamiento</span>
        </button>

        {/* Callout Advertencia */}
        <button
          type="button"
          onClick={() => onInsert('> [!warning] Peligro Inminente\n> Escuchas el crujido de hojas secas detrás de ti.\n\n')}
          className="px-2.5 py-1 rounded bg-[#DC143C]/15 hover:bg-[#DC143C]/30 text-[#DC143C] border border-[#DC143C]/30 flex items-center gap-1 transition-all cursor-pointer font-bold"
          title="Insertar Alerta"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Alerta</span>
        </button>

        {/* Color Hero/Dorado */}
        <button
          type="button"
          onClick={() => onInsert('[Texto triunfal]{color: hero}')}
          className="px-2.5 py-1 rounded bg-[#ffd700]/20 hover:bg-[#ffd700]/40 text-[#ffd700] border border-[#ffd700]/40 flex items-center gap-1 transition-all cursor-pointer font-bold"
          title="Color Héroe (Dorado)"
        >
          <Palette className="w-3 h-3" />
          <span>Gold</span>
        </button>

        {/* Color Peligro/Sangre */}
        <button
          type="button"
          onClick={() => onInsert('[Ataque carmesí]{color: blood}')}
          className="px-2.5 py-1 rounded bg-[#dc143c]/20 hover:bg-[#dc143c]/40 text-[#dc143c] border border-[#dc143c]/40 flex items-center gap-1 transition-all cursor-pointer font-bold"
          title="Color Peligro (Sangre)"
        >
          <Flame className="w-3 h-3" />
          <span>Blood</span>
        </button>

        {/* Efecto Shake */}
        <button
          type="button"
          onClick={() => onInsert('[¡El suelo colapsa!]{effect: shake}')}
          className="px-2.5 py-1 rounded bg-[#8B2FE0]/30 hover:bg-[#8B2FE0]/50 text-white border border-[#8B2FE0] flex items-center gap-1 transition-all cursor-pointer font-bold"
          title="Efecto Temblor"
        >
          <Zap className="w-3 h-3 text-[#FFD700]" />
          <span>Shake</span>
        </button>

        {/* Decisión CYOA */}
        <button
          type="button"
          onClick={() => onInsert('\n- [ ] [Avanzar en silencio por las sombras](#opcion-sigilo)\n- [ ] [Desenvainar la espada y encarar](#opcion-combate)\n\n')}
          className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1 transition-all cursor-pointer font-bold"
          title="Insertar Botón CYOA"
        >
          <span>🔘 CYOA</span>
        </button>
      </div>

      {/* Cheatsheet Toggle */}
      <div>
        <button
          type="button"
          onClick={toggleCheatsheet}
          className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            showCheatsheet
              ? 'bg-[#C084FC] text-black border-[#C084FC]'
              : 'bg-black/40 text-[#C084FC] border-[#8B2FE0]/40 hover:border-[#C084FC]'
          }`}
          title="Guía Rápida de Sintaxis"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>GUÍA / SINTAXIS</span>
        </button>
      </div>
    </div>
  );
}
