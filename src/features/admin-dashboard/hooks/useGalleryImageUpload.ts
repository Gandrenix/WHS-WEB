'use client';
// Client: subida de una imagen de galería directo del navegador a Supabase Storage. La Server
// Action solo autoriza (devuelve ruta + token firmado); el archivo NO pasa por la app, así que
// no hay tope de tamaño propio ni choca con el límite de ~6 MB por petición de Netlify.
import { useCallback, useState, useTransition } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { createGalleryUploadAction } from '../actions/project.actions';

const BUCKET = 'whs-media';

export interface GalleryUploadError {
  title: string;
  hint?: string;
  /** Mensaje original, por si hay que reportarlo. */
  detail: string;
}

/** Traduce el error crudo (de Supabase, de red o de la acción) a algo que se lea de un vistazo. */
function describeError(raw: string): GalleryUploadError {
  const msg = raw.toLowerCase();
  if (msg.includes('maximum allowed size') || msg.includes('payload too large') || msg.includes('413')) {
    return {
      title: 'La imagen supera el límite de tu proyecto en Supabase',
      hint: 'En Supabase: Storage → Settings → "Upload file size limit" (y revisa el límite del bucket whs-media).',
      detail: raw,
    };
  }
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network request failed')) {
    return {
      title: 'Se cortó la conexión mientras se subía',
      hint: 'Revisa tu internet e inténtalo de nuevo. Si el archivo es muy pesado puede tardar unos segundos.',
      detail: raw,
    };
  }
  if (msg.includes('no autorizado')) {
    return { title: 'Tu sesión de administrador expiró', hint: 'Inicia sesión de nuevo y repite la subida.', detail: raw };
  }
  if (msg.includes('url and key are required')) {
    return {
      title: 'Faltan las credenciales de Supabase en este entorno',
      hint: 'Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      detail: raw,
    };
  }
  return { title: 'No se pudo subir la imagen', detail: raw };
}

export function useGalleryImageUpload(onUploaded: (publicUrl: string) => void) {
  const [isUploading, startTransition] = useTransition();
  const [error, setError] = useState<GalleryUploadError | null>(null);

  const dismissError = useCallback(() => setError(null), []);

  const upload = useCallback(
    (file: File) => {
      setError(null);
      startTransition(async () => {
        try {
          const ticket = await createGalleryUploadAction({ fileName: file.name, contentType: file.type });
          if (ticket.error || !ticket.path || !ticket.token || !ticket.publicUrl) {
            setError(describeError(ticket.error ?? 'No se pudo preparar la subida.'));
            return;
          }
          const { error: uploadError } = await createClient()
            .storage.from(BUCKET)
            .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
          if (uploadError) {
            setError(describeError(uploadError.message));
            return;
          }
          onUploaded(ticket.publicUrl);
        } catch (e) {
          setError(describeError(e instanceof Error ? e.message : String(e)));
        }
      });
    },
    [onUploaded]
  );

  return { upload, isUploading, error, dismissError };
}
