'use server';

// Server Actions de la feature `comments`. Patrón confirmado en el resto del
// codebase (favorites/chapter_bookmarks/contact_messages): el repositorio del
// entity (`entities/comment/server.ts`) es SOLO lectura; toda escritura vive
// acá, con `createClient()` + `auth.getUser()` resueltos en cada action.
import { createClient } from '@/shared/lib/supabase/server';
import { getCommentsForProject } from '@/entities/comment/server';
import type { CommentWithAuthor, GetCommentsResult } from '@/entities/comment';
import { CommentSchema } from '../schemas/comment.schema';

export interface FetchCommentsParams {
  projectId: string;
  /** null = comentarios generales de la obra; N = capítulo puntual (posicional). */
  chapterNumber: number | null;
  offset?: number;
  /**
   * Id del usuario con sesión activa, solo para calcular `viewerHasReacted`
   * por comentario. Es seguro que lo mande el cliente sin volver a
   * verificarlo acá: en el peor caso (alguien lo falsea) lo único que cambia
   * es qué corazón se ve "lleno" para ESE visitante, nada de datos ni de
   * permisos de escritura depende de este valor.
   */
  currentUserId?: string | null;
}

export async function fetchCommentsAction({
  projectId,
  chapterNumber,
  offset = 0,
  currentUserId,
}: FetchCommentsParams): Promise<GetCommentsResult> {
  if (!projectId) return { threads: [], hasMore: false };
  return getCommentsForProject(projectId, chapterNumber, { offset, currentUserId });
}

export interface CommentActionResult {
  error?: string;
  comment?: CommentWithAuthor;
}

export interface CreateCommentParams {
  projectId: string;
  /** null = comentario general de la obra; N = capítulo puntual (posicional). */
  chapterNumber: number | null;
  chapterTitle?: string | null;
  /** null/omitido = comentario raíz; un id = respuesta (un solo nivel de anidamiento). */
  parentId?: string | null;
  body: string;
}

export async function createCommentAction({
  projectId,
  chapterNumber,
  chapterTitle,
  parentId = null,
  body,
}: CreateCommentParams): Promise<CommentActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Debes iniciar sesión para comentar.' };
    }

    const parsed = CommentSchema.safeParse({ body });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Comentario inválido.' };
    }

    const { data, error: dbError } = await supabase
      .from('comments')
      .insert({
        project_id: projectId,
        user_id: user.id,
        parent_id: parentId,
        chapter_number: chapterNumber,
        chapter_title: chapterTitle ?? null,
        body: parsed.data.body,
      })
      .select('*, author:profiles(display_name, avatar_url)')
      .single();

    if (dbError || !data) {
      return { error: `Error al publicar tu comentario: ${dbError?.message || 'inténtalo de nuevo.'}` };
    }

    // Notificación "te respondieron" — solo para respuestas (no comentarios
    // raíz) y solo si no te estás respondiendo a vos mismo. Falla en
    // silencio a propósito: que la notificación no se pueda crear (ej. RLS,
    // red) nunca debe hacer fallar la publicación del comentario en sí.
    if (parentId) {
      try {
        const { data: parentComment } = await supabase
          .from('comments')
          .select('user_id')
          .eq('id', parentId)
          .maybeSingle();

        if (parentComment && parentComment.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: parentComment.user_id,
            actor_id: user.id,
            type: 'reply',
            comment_id: data.id,
            project_id: projectId,
            chapter_number: chapterNumber,
          });
        }
      } catch {
        // Silencioso a propósito, ver comentario arriba.
      }
    }

    return { comment: data as unknown as CommentWithAuthor };
  } catch {
    return { error: 'No se pudo publicar tu comentario.' };
  }
}

export async function updateCommentAction(commentId: string, body: string): Promise<CommentActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Debes iniciar sesión para editar comentarios.' };
    }

    const parsed = CommentSchema.safeParse({ body });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Comentario inválido.' };
    }

    // El `.eq('user_id', user.id)` es defensivo (además de la RLS "Authors can
    // update own comments"): si el comentario es de otro usuario, el UPDATE
    // simplemente no afecta filas y `data` vuelve null.
    const { data, error: dbError } = await supabase
      .from('comments')
      .update({ body: parsed.data.body, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select('*, author:profiles(display_name, avatar_url)')
      .single();

    if (dbError || !data) {
      return { error: `Error al editar tu comentario: ${dbError?.message || 'inténtalo de nuevo.'}` };
    }

    return { comment: data as unknown as CommentWithAuthor };
  } catch {
    return { error: 'No se pudo editar tu comentario.' };
  }
}

export interface DeleteCommentResult {
  error?: string;
}

// Borrado suave (is_deleted=true), NO DELETE físico: preserva el hilo de
// respuestas si el comentario borrado es un comentario raíz (ver notas en
// supabase_comments_schema.sql). El borrado por parte de un admin desde el
// panel COMUNIDAD es una action separada (Fase 5).
export async function deleteCommentAction(commentId: string): Promise<DeleteCommentResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Debes iniciar sesión para eliminar comentarios.' };
    }

    const { error: dbError } = await supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (dbError) {
      return { error: `Error al eliminar tu comentario: ${dbError.message}` };
    }

    return {};
  } catch {
    return { error: 'No se pudo eliminar tu comentario.' };
  }
}

export interface ToggleReactionResult {
  error?: string;
  reacted?: boolean;
}

// Like/heart simple, sin tipos de reacción (ver supabase_comments_phase6.sql):
// alterna entre reaccionar y quitar la reacción según si ya existe la fila.
export async function toggleReactionAction(commentId: string): Promise<ToggleReactionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Debes iniciar sesión para reaccionar.' };
    }

    const { data: existing } = await supabase
      .from('comment_reactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error: deleteError } = await supabase.from('comment_reactions').delete().eq('id', existing.id);
      if (deleteError) return { error: 'No se pudo quitar tu reacción.' };
      return { reacted: false };
    }

    const { error: insertError } = await supabase
      .from('comment_reactions')
      .insert({ comment_id: commentId, user_id: user.id });

    if (insertError) return { error: 'No se pudo reaccionar al comentario.' };

    return { reacted: true };
  } catch {
    return { error: 'No se pudo reaccionar al comentario.' };
  }
}
