import 'server-only';
import { createClient } from '@/shared/lib/supabase/server';
import type {
  CommentWithAuthor,
  CommentThread,
  GetCommentsResult,
  CommentModerationRow,
  GetCommentsForModerationResult,
} from '../types';

const PLACEHOLDER_DELETED_BODY = '[comentario eliminado]';

// RLS permite SELECT(true) sobre TODAS las filas de `comments`, incluidas las
// marcadas is_deleted=true (así el autor y los admins pueden seguir viéndolas
// para moderar/restaurar). Eso significa que el texto real de un comentario
// "borrado" sigue siendo consultable directo desde la anon key si no se oculta
// acá — por eso la redacción del body pasa en el repositorio, no en la UI.
function redactIfDeleted(comment: CommentWithAuthor): CommentWithAuthor {
  if (!comment.is_deleted) return comment;
  return { ...comment, body: PLACEHOLDER_DELETED_BODY };
}

export interface GetCommentsOptions {
  limit?: number;
  offset?: number;
  /** Para calcular `viewerHasReacted` por comentario. null/omitido = visitante sin sesión. */
  currentUserId?: string | null;
}

// Trae las reacciones de un lote de comentarios y las reduce a
// { [comment_id]: { count, viewerHasReacted } } en un solo query extra —
// evita N+1 (una consulta de reacciones por comentario).
async function getReactionSummary(
  supabase: Awaited<ReturnType<typeof createClient>>,
  commentIds: string[],
  currentUserId?: string | null
): Promise<Map<string, { count: number; viewerHasReacted: boolean }>> {
  const summary = new Map<string, { count: number; viewerHasReacted: boolean }>();
  if (commentIds.length === 0) return summary;

  const { data } = await supabase
    .from('comment_reactions')
    .select('comment_id, user_id')
    .in('comment_id', commentIds);

  for (const row of data || []) {
    const entry = summary.get(row.comment_id) || { count: 0, viewerHasReacted: false };
    entry.count += 1;
    if (currentUserId && row.user_id === currentUserId) entry.viewerHasReacted = true;
    summary.set(row.comment_id, entry);
  }

  return summary;
}

// Trae los comentarios RAÍZ (parent_id IS NULL) de una obra o de un capítulo
// puntual, paginados, con sus respuestas ya agrupadas (un solo nivel).
// chapterNumber === null -> comentarios generales de la obra (PDF, video,
// galería, ficha técnica); chapterNumber === N -> capítulo N (posicional).
export async function getCommentsForProject(
  projectId: string,
  chapterNumber: number | null,
  { limit = 20, offset = 0, currentUserId }: GetCommentsOptions = {}
): Promise<GetCommentsResult> {
  try {
    const supabase = await createClient();

    let topLevelQuery = supabase
      .from('comments')
      .select('*, author:profiles(display_name, avatar_url)')
      .eq('project_id', projectId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      // Se pide un elemento de más (range es inclusivo en ambos extremos) para
      // saber si hay más páginas sin tener que hacer un COUNT aparte.
      .range(offset, offset + limit);

    topLevelQuery =
      chapterNumber === null
        ? topLevelQuery.is('chapter_number', null)
        : topLevelQuery.eq('chapter_number', chapterNumber);

    const { data: topLevelRaw, error } = await topLevelQuery;
    if (error || !topLevelRaw) return { threads: [], hasMore: false };

    const hasMore = topLevelRaw.length > limit;
    const topLevel = (
      hasMore ? topLevelRaw.slice(0, limit) : topLevelRaw
    ) as unknown as CommentWithAuthor[];

    if (topLevel.length === 0) return { threads: [], hasMore: false };

    const topLevelIds = topLevel.map((c) => c.id);

    const { data: repliesRaw } = await supabase
      .from('comments')
      .select('*, author:profiles(display_name, avatar_url)')
      .in('parent_id', topLevelIds)
      .order('created_at', { ascending: true });

    const replies = ((repliesRaw as unknown as CommentWithAuthor[]) || []).map(redactIfDeleted);

    const reactionSummary = await getReactionSummary(
      supabase,
      [...topLevelIds, ...replies.map((r) => r.id)],
      currentUserId
    );
    const withReactions = (comment: CommentWithAuthor): CommentWithAuthor => {
      const entry = reactionSummary.get(comment.id);
      return { ...comment, reactionCount: entry?.count ?? 0, viewerHasReacted: entry?.viewerHasReacted ?? false };
    };

    const threads: CommentThread[] = topLevel
      .map(redactIfDeleted)
      .map(withReactions)
      .map((comment) => ({
        ...comment,
        replies: replies.filter((r) => r.parent_id === comment.id).map(withReactions),
      }));

    return { threads, hasMore };
  } catch {
    return { threads: [], hasMore: false };
  }
}

// Cantidad de comentarios raíz + respuestas de una obra/capítulo, para mostrar
// un contador ("12 comentarios") sin traer todas las filas.
export async function getCommentsCount(
  projectId: string,
  chapterNumber: number | null
): Promise<number> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId);

    query = chapterNumber === null ? query.is('chapter_number', null) : query.eq('chapter_number', chapterNumber);

    const { count } = await query;
    return count ?? 0;
  } catch {
    return 0;
  }
}

// Lista plana (sin agrupar en hilos) de comentarios de TODAS las obras, para
// la sección COMUNIDAD del panel de admin. A propósito no filtra is_deleted
// ni redacta el body (a diferencia de getCommentsForProject): el admin
// necesita ver el contenido real, incluso de lo ya moderado, para poder
// revisar el historial.
export async function getCommentsForModeration({
  limit = 30,
  offset = 0,
}: GetCommentsOptions = {}): Promise<GetCommentsForModerationResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles(display_name, avatar_url), project:projects(title)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit);

    if (error || !data) return { comments: [], hasMore: false };

    const hasMore = data.length > limit;
    const comments = (hasMore ? data.slice(0, limit) : data) as unknown as CommentModerationRow[];

    return { comments, hasMore };
  } catch {
    return { comments: [], hasMore: false };
  }
}

// Cantidad total de comentarios activos (no eliminados) de todas las obras,
// para el badge de la sección COMUNIDAD en el sidebar del admin.
export async function getTotalCommentsCount(): Promise<number> {
  try {
    const supabase = await createClient();

    const { count } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('is_deleted', false);

    return count ?? 0;
  } catch {
    return 0;
  }
}
