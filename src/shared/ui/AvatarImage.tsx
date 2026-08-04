'use client';

// Avatar con fallback automático: si la imagen (foto de Google, subida propia,
// etc.) falla al cargar -bloqueada por un adblocker, URL vencida, CORS- se
// muestra la inicial en vez de dejar un ícono roto o un espacio en blanco.
import { useState } from 'react';
import Image from 'next/image';

export interface AvatarImageProps {
  src: string | null | undefined;
  alt: string;
  fallback: string;
  className?: string;
}

export function AvatarImage({ src, alt, fallback, className }: AvatarImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
