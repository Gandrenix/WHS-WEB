'use client';
// Client: guarda/quita un capítulo puntual. Se pasa como referencia de componente
// (no como elemento ya resuelto) desde la página hacia document-reader, para poder
// renderizarlo con el capítulo que esté activo en cada momento sin violar boundaries
// (document-reader nunca importa nada de reader-dashboard directamente).

import { useState, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleChapterBookmarkAction } from '../actions/library.actions';

export interface ChapterBookmarkButtonProps {
  projectId: string;
  chapterNumber: number;
  chapterTitle?: string | null;
  initialBookmarked: boolean;
}

export function ChapterBookmarkButton({
  projectId,
  chapterNumber,
  chapterTitle,
  initialBookmarked,
}: ChapterBookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setIsBookmarked((prev) => !prev);
    startTransition(async () => {
      const result = await toggleChapterBookmarkAction(projectId, chapterNumber, chapterTitle);
      if (result.error) {
        setIsBookmarked((prev) => !prev);
        return;
      }
      setIsBookmarked(result.isBookmarked);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={isBookmarked ? 'Quitar este capítulo de guardados' : 'Guardar este capítulo'}
      aria-label={isBookmarked ? 'Quitar este capítulo de guardados' : 'Guardar este capítulo'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer ${
        isBookmarked
          ? 'bg-[#7ED957]/20 border-[#7ED957]/50 text-[#7ED957]'
          : 'bg-black/40 border-white/15 text-[#F2EDE4]/70 hover:border-[#7ED957]/40 hover:text-[#7ED957]'
      }`}
    >
      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
      {isBookmarked ? 'Capítulo guardado' : 'Guardar capítulo'}
    </button>
  );
}
