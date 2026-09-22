'use server';

// Server Actions para administrar la playlist del reproductor del header
// (antes una única canción hardcodeada, ver supabase_songs.sql). Mismo
// patrón que specimenCard.actions.ts: la subida de archivo va al bucket
// `whs-media` (carpeta songs/), el checkeo de sesión acá es liviano — la
// protección real de "solo admin puede escribir" vive en la RLS (is_admin())
// de la tabla.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SongSchema, MAX_SONG_FILE_BYTES } from '../schemas/song.schema';
import type { ActionResponse } from './project.actions';

function parseSongForm(formData: FormData) {
  return SongSchema.safeParse({
    title: formData.get('title'),
    artist: formData.get('artist') || undefined,
    position: formData.get('position'),
  });
}

async function requireAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.NODE_ENV === 'production') {
    return { supabase, error: 'No autorizado. Inicie sesión como administrador.' } as const;
  }
  return { supabase, error: null } as const;
}

export async function createSongAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const { supabase, error: authError } = await requireAdminClient();
  if (authError) return { error: authError };

  const parsed = parseSongForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return { error: 'Selecciona un archivo MP3.' };
  }
  if (file.size > MAX_SONG_FILE_BYTES) {
    return { error: `El archivo pesa demasiado (máx. ${MAX_SONG_FILE_BYTES / 1024 / 1024} MB).` };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'mp3';
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `songs/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('whs-media').upload(filePath, file, {
      contentType: file.type || 'audio/mpeg',
    });
    if (uploadError) {
      return { error: `Error al subir el archivo: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabase.storage.from('whs-media').getPublicUrl(filePath);

    const { error: dbError } = await supabase.from('songs').insert({
      ...parsed.data,
      audio_url: publicUrlData.publicUrl,
    });

    if (dbError) {
      return { error: `Error al registrar la canción: ${dbError.message}` };
    }

    revalidatePath('/');
    revalidatePath('/admin/dashboard/musica');

    return { success: true };
  } catch {
    return { error: 'Error inesperado al subir la canción.' };
  }
}

export async function updateSongAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const { supabase, error: authError } = await requireAdminClient();
  if (authError) return { error: authError };

  const targetSongId = formData.get('target_song_id') as string;
  if (!targetSongId) {
    return { error: 'ID de canción no especificado.' };
  }

  const parsed = parseSongForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  // Reemplazar el MP3 es opcional al editar: solo se sube si se eligió un archivo nuevo.
  const file = formData.get('file') as File | null;
  let audioUrl: string | undefined;

  if (file && file.size > 0) {
    if (file.size > MAX_SONG_FILE_BYTES) {
      return { error: `El archivo pesa demasiado (máx. ${MAX_SONG_FILE_BYTES / 1024 / 1024} MB).` };
    }
    try {
      const fileExt = file.name.split('.').pop() || 'mp3';
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `songs/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('whs-media').upload(filePath, file, {
        contentType: file.type || 'audio/mpeg',
      });
      if (uploadError) {
        return { error: `Error al subir el archivo: ${uploadError.message}` };
      }
      audioUrl = supabase.storage.from('whs-media').getPublicUrl(filePath).data.publicUrl;
    } catch {
      return { error: 'Error inesperado al subir el archivo nuevo.' };
    }
  }

  const { error: dbError } = await supabase
    .from('songs')
    .update({
      ...parsed.data,
      ...(audioUrl ? { audio_url: audioUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetSongId);

  if (dbError) {
    return { error: `Error al actualizar la canción: ${dbError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard/musica');

  return { success: true };
}

export async function deleteSongAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const { supabase, error: authError } = await requireAdminClient();
  if (authError) return { error: authError };

  const targetSongId = formData.get('target_song_id') as string;
  if (!targetSongId) {
    return { error: 'ID de canción no especificado para eliminar.' };
  }

  // No se borra el archivo del bucket whs-media (mismo criterio que
  // deleteProjectAction/las fichas de espécimen): un fallo de storage a
  // mitad de un delete es peor que dejar un archivo huérfano.
  const { error: dbError } = await supabase.from('songs').delete().eq('id', targetSongId);

  if (dbError) {
    return { error: `Error al eliminar la canción: ${dbError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard/musica');

  return { success: true };
}

export async function setDefaultSongAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const { supabase, error: authError } = await requireAdminClient();
  if (authError) return { error: authError };

  const targetSongId = formData.get('target_song_id') as string;
  if (!targetSongId) {
    return { error: 'ID de canción no especificado.' };
  }

  // Dos UPDATE en secuencia, no un toggle sobre la fila objetivo: el índice
  // único parcial (idx_songs_single_default) exige que nunca haya dos filas en
  // true a la vez, así que primero se apaga la anterior (deja la tabla en
  // cero) y luego se enciende la nueva — cada UPDATE es su propia transacción
  // atómica en Postgres, así que no hay ventana donde el índice se viole.
  const { error: unsetError } = await supabase.from('songs').update({ is_default: false }).eq('is_default', true);
  if (unsetError) {
    return { error: `Error al actualizar la canción principal: ${unsetError.message}` };
  }

  const { error: setError } = await supabase
    .from('songs')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', targetSongId);
  if (setError) {
    return { error: `Error al marcar como principal: ${setError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard/musica');

  return { success: true };
}
