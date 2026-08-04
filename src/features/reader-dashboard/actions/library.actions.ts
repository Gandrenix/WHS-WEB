'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { isProjectFavorited } from '@/entities/library/server';

const ProgressSchema = z.object({
  projectId: z.string().min(1),
  chapterNumber: z.number().int().min(1),
  totalChapters: z.number().int().min(1),
  status: z.enum(['reading', 'completed']),
});

const ChapterBookmarkSchema = z.object({
  projectId: z.string().min(1),
  chapterNumber: z.number().int().min(1),
  chapterTitle: z.string().trim().max(200).optional().nullable(),
});

export interface ToggleFavoriteResult {
  isFavorited: boolean;
  error?: string;
}

export async function toggleFavoriteAction(projectId: string): Promise<ToggleFavoriteResult> {
  if (!projectId || typeof projectId !== 'string') {
    return { isFavorited: false, error: 'Obra inválida.' };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isFavorited: false, error: 'Debes iniciar sesión para guardar obras.' };
    }

    const alreadyFavorited = await isProjectFavorited(user.id, projectId);

    if (alreadyFavorited) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('project_id', projectId);
      revalidatePath('/biblioteca');
      return { isFavorited: false };
    }

    await supabase.from('favorites').insert({ user_id: user.id, project_id: projectId });
    revalidatePath('/biblioteca');
    return { isFavorited: true };
  } catch {
    return { isFavorited: false, error: 'No se pudo actualizar tus favoritos.' };
  }
}

export interface ToggleChapterBookmarkResult {
  isBookmarked: boolean;
  error?: string;
}

// Guarda/quita un capítulo puntual — distinto de "favoritos" (que guarda la obra completa).
export async function toggleChapterBookmarkAction(
  projectId: string,
  chapterNumber: number,
  chapterTitle?: string | null
): Promise<ToggleChapterBookmarkResult> {
  const parsed = ChapterBookmarkSchema.safeParse({ projectId, chapterNumber, chapterTitle });
  if (!parsed.success) {
    return { isBookmarked: false, error: 'Capítulo inválido.' };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isBookmarked: false, error: 'Debes iniciar sesión para guardar capítulos.' };
    }

    const { data: existing } = await supabase
      .from('chapter_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('project_id', parsed.data.projectId)
      .eq('chapter_number', parsed.data.chapterNumber)
      .maybeSingle();

    if (existing) {
      await supabase.from('chapter_bookmarks').delete().eq('id', existing.id);
      revalidatePath('/biblioteca');
      return { isBookmarked: false };
    }

    await supabase.from('chapter_bookmarks').insert({
      user_id: user.id,
      project_id: parsed.data.projectId,
      chapter_number: parsed.data.chapterNumber,
      chapter_title: parsed.data.chapterTitle || null,
    });
    revalidatePath('/biblioteca');
    return { isBookmarked: true };
  } catch {
    return { isBookmarked: false, error: 'No se pudo guardar el capítulo.' };
  }
}

// Se llama desde el lector (DocumentReaderContainer / MarkdownReader) al abrir una obra
// o cambiar de capítulo. Es "fire and forget": si falla, no debe interrumpir la lectura.
export async function updateReadingProgressAction(
  projectId: string,
  chapterNumber: number,
  totalChapters: number,
  status: 'reading' | 'completed'
): Promise<void> {
  const parsed = ProgressSchema.safeParse({ projectId, chapterNumber, totalChapters, status });
  if (!parsed.success) return;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.rpc('upsert_reading_progress', {
      p_project_id: parsed.data.projectId,
      p_chapter_number: parsed.data.chapterNumber,
      p_total_chapters: parsed.data.totalChapters,
      p_status: parsed.data.status,
    });

    revalidatePath('/biblioteca');
  } catch {
    // Fallo silencioso: el tracking de progreso es una mejora de experiencia,
    // nunca debe romper la lectura del usuario.
  }
}
