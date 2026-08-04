'use client';
// Client: botón de corazón que llama la Server Action de favoritos y refleja el estado optimistamente

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavoriteAction } from '../actions/library.actions';

export interface FavoriteToggleButtonProps {
  projectId: string;
  initialFavorited: boolean;
  variant?: 'solid' | 'ghost';
  className?: string;
}

export function FavoriteToggleButton({
  projectId,
  initialFavorited,
  variant = 'ghost',
  className = '',
}: FavoriteToggleButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // Optimista: refleja el cambio de inmediato, revierte si el servidor falla
    setIsFavorited((prev) => !prev);
    startTransition(async () => {
      const result = await toggleFavoriteAction(projectId);
      if (result.error) {
        setIsFavorited((prev) => !prev);
        return;
      }
      setIsFavorited(result.isFavorited);
    });
  };

  const baseStyles =
    variant === 'solid'
      ? `p-2.5 rounded-full backdrop-blur-md border transition-all ${
          isFavorited
            ? 'bg-[#7A1220] border-[#7A1220] text-white'
            : 'bg-black/50 border-white/20 text-white hover:border-[#7A1220]'
        }`
      : `p-2 rounded-full transition-all ${
          isFavorited ? 'text-[#7A1220]' : 'text-[#F2EDE4]/50 hover:text-[#7A1220]'
        }`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={isFavorited ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      aria-label={isFavorited ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`${baseStyles} disabled:opacity-60 cursor-pointer ${className}`}
    >
      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
    </button>
  );
}
