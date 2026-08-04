'use server';

// Server Actions de la sección COMUNIDAD del panel de admin (moderación de
// comentarios). Separadas de `features/comments/actions/comments.actions.ts`
// a propósito: esa feature cubre la escritura del PROPIO autor (RLS "Authors
// can update own comments"), esta cubre la moderación del ADMIN (RLS "Admins
// can moderate comments"). No pueden vivir en el mismo archivo porque
// admin-dashboard no puede importar la feature `comments` (boundaries
// prohíbe feature->feature); ambas escriben la misma tabla `comments`, cada
// una desde su propio permiso.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { getCommentsForModeration } from '@/entities/comment/server';
import type { GetCommentsForModerationResult } from '@/entities/comment';
import type { ActionResponse } from './project.actions';

export async function fetchCommentsForModerationAction(offset: number): Promise<GetCommentsForModerationResult> {
  return getCommentsForModeration({ offset });
}

export async function deleteCommentAsAdminAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado. Inicie sesión como administrador para moderar comentarios.' };
  }

  const targetCommentId = formData.get('target_comment_id') as string;
  if (!targetCommentId) {
    return { error: 'ID de comentario no especificado para eliminar.' };
  }

  // Borrado suave (is_deleted=true), NO DELETE físico: preserva el hilo de
  // respuestas si el comentario moderado es un comentario raíz. La RLS
  // "Admins can moderate comments" (USING public.is_admin()) es la que
  // realmente decide si este UPDATE tiene efecto: si el usuario logeado no
  // es admin, la RLS bloquea la fila sin lanzar error explícito.
  const { error: dbError } = await supabase
    .from('comments')
    .update({ is_deleted: true, deleted_by_admin: true })
    .eq('id', targetCommentId);

  if (dbError) {
    return { error: `Error al eliminar el comentario: ${dbError.message}` };
  }

  revalidatePath('/admin/dashboard/comunidad');

  return { success: true };
}
