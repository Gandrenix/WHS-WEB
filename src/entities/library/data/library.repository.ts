import 'server-only';
import { createClient } from '@/shared/lib/supabase/server';
import type { LibraryFavorite, LibraryProgress, LibraryChapterBookmark } from '../types';

export async function getFavoritesForUser(userId: string): Promise<LibraryFavorite[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('favorites')
      .select('id, project_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as LibraryFavorite[];
  } catch {
    return [];
  }
}

export async function getReadingProgressForUser(userId: string): Promise<LibraryProgress[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reading_progress')
      .select('id, project_id, chapter_number, total_chapters, status, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data as LibraryProgress[];
  } catch {
    return [];
  }
}

export async function isProjectFavorited(userId: string, projectId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle();

    return Boolean(data);
  } catch {
    return false;
  }
}

export async function getChapterBookmarksForUser(userId: string): Promise<LibraryChapterBookmark[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('chapter_bookmarks')
      .select('id, project_id, chapter_number, chapter_title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as LibraryChapterBookmark[];
  } catch {
    return [];
  }
}

// Devuelve solo los números de capítulo guardados de una obra puntual — es lo que
// necesita el lector para saber qué botones de "guardar capítulo" pintar como activos.
export async function getBookmarkedChapterNumbers(userId: string, projectId: string): Promise<number[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('chapter_bookmarks')
      .select('chapter_number')
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (error || !data) return [];
    return data.map((row) => row.chapter_number);
  } catch {
    return [];
  }
}
