'use client';

// Lista de moderación de la sección COMUNIDAD. Mismo patrón que ProjectList:
// useActionState + <form action> con id oculto para el borrado, modal de
// confirmación antes de cualquier eliminación. A diferencia de ProjectList,
// el "borrado" acá es suave (is_deleted=true), así que tras confirmarlo la
// fila se queda visible con un badge en vez de desaparecer de la lista.
import { useState, useActionState, useEffect, useTransition } from 'react';
import { AlertTriangle, Loader2, MessageCircle, Trash2, X } from 'lucide-react';
import type { CommentModerationRow } from '@/entities/comment';
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime';
import { AvatarImage } from '@/shared/ui/AvatarImage';
import { deleteCommentAsAdminAction, fetchCommentsForModerationAction } from '../actions/community.actions';
import type { ActionResponse } from '../actions/project.actions';

export interface CommunityModerationListProps {
  initialComments: CommentModerationRow[];
  initialHasMore: boolean;
}

const initialState: ActionResponse = { error: null };

function initials(name: string | null): string {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function CommunityModerationList({ initialComments, initialHasMore }: CommunityModerationListProps) {
  const [comments, setComments] = useState(initialComments);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [deleteModalComment, setDeleteModalComment] = useState<CommentModerationRow | null>(null);
  const [isLoadingMore, startLoadMoreTransition] = useTransition();

  const [deleteState, deleteFormAction, isDeletePending] = useActionState(deleteCommentAsAdminAction, initialState);

  // Al éxito: marca la fila como eliminada en el estado local (no la quita
  // de la lista, para que el admin vea el badge "Eliminado por admin") y
  // cierra el modal. Si hay error, el modal se queda abierto con el mensaje.
  useEffect(() => {
    if (deleteState?.success && deleteModalComment) {
      setComments((prev) =>
        prev.map((c) => (c.id === deleteModalComment.id ? { ...c, is_deleted: true, deleted_by_admin: true } : c))
      );
      setDeleteModalComment(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteState]);

  const loadMore = () => {
    startLoadMoreTransition(async () => {
      const result = await fetchCommentsForModerationAction(comments.length);
      setComments((prev) => [...prev, ...result.comments]);
      setHasMore(result.hasMore);
    });
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-20 bg-[#160E0A] rounded-2xl border border-dashed border-white/20 flex flex-col items-center font-mono">
        <div className="w-16 h-16 bg-[#8B2FE0]/20 rounded-full flex items-center justify-center mb-4 border border-[#8B2FE0]/40">
          <MessageCircle className="w-7 h-7 text-[#C084FC]" />
        </div>
        <h3 className="text-white text-xl font-black mb-2 uppercase tracking-tight">SIN COMENTARIOS TODAVÍA</h3>
        <p className="text-[#F2EDE4]/70 text-xs max-w-sm font-sans">
          Cuando los usuarios comenten en las obras, aparecerán acá para que puedas moderarlos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono">
      {comments.map((comment) => {
        const authorName = comment.author?.display_name || 'Usuario';
        const projectTitle = comment.project?.title || 'Obra eliminada';

        return (
          <div key={comment.id} className="bg-[#160E0A] border border-white/15 rounded-2xl p-5 flex gap-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#8B2FE0]/20 border border-white/15 shrink-0 flex items-center justify-center text-xs font-bold text-[#C084FC]">
              <AvatarImage
                src={comment.author?.avatar_url}
                alt={authorName}
                fallback={initials(authorName)}
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-1.5">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-white">{authorName}</span>
                  <span className="text-[#F2EDE4]/40">&bull;</span>
                  <span className="text-[#C084FC] truncate max-w-[220px]" title={projectTitle}>
                    {projectTitle}
                  </span>
                  {comment.chapter_number && (
                    <span className="text-[#F2EDE4]/40">
                      &bull; Cap. {comment.chapter_number}
                      {comment.chapter_title ? `: ${comment.chapter_title}` : ''}
                    </span>
                  )}
                  <span className="text-[#F2EDE4]/40">&bull;</span>
                  <span className="text-[#F2EDE4]/40">{formatRelativeTime(comment.created_at)}</span>
                </div>

                {!comment.is_deleted && (
                  <button
                    type="button"
                    onClick={() => setDeleteModalComment(comment)}
                    className="p-2 bg-[#7A1220]/25 hover:bg-[#7A1220] text-[#ff8a95] hover:text-white rounded-lg transition-all border border-[#7A1220]/50 cursor-pointer shrink-0"
                    title="Eliminar comentario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {comment.is_deleted && (
                <span className="inline-block mb-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#7A1220]/30 text-[#ff8a95] border border-[#7A1220]/50">
                  {comment.deleted_by_admin ? 'Eliminado por admin' : 'Eliminado por el autor'}
                </span>
              )}

              <p
                className={`text-sm font-sans leading-relaxed whitespace-pre-wrap break-words ${
                  comment.is_deleted ? 'italic text-[#F2EDE4]/40' : 'text-[#F2EDE4]/90'
                }`}
              >
                {comment.body}
              </p>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={isLoadingMore}
          className="w-full py-3 rounded-xl border border-white/15 bg-black/40 hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-[#F2EDE4]/70 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Cargar más comentarios'}
        </button>
      )}

      {/* DELETE CONFIRMATION MODAL — el borrado nunca ocurre con un solo clic */}
      {deleteModalComment && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#120A08] border border-[#7A1220] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-bold text-[#ff8a95] text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> ELIMINAR COMENTARIO
              </span>
              <button
                type="button"
                onClick={() => setDeleteModalComment(null)}
                className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deleteState?.error && (
              <div className="p-3 bg-[#7A1220]/40 border border-[#7A1220] rounded-xl text-white text-xs font-bold">
                {deleteState.error}
              </div>
            )}

            <div className="p-4 bg-[#7A1220]/15 border border-[#7A1220]/40 rounded-xl">
              <p className="font-sans text-xs text-[#F2EDE4]/90 leading-relaxed">
                Estás a punto de eliminar el comentario de{' '}
                <strong className="text-white">{deleteModalComment.author?.display_name || 'Usuario'}</strong> en{' '}
                <strong className="text-white">
                  &ldquo;{deleteModalComment.project?.title || 'la obra'}&rdquo;
                </strong>
                . Quedará marcado como <strong className="text-[#ff8a95]">eliminado por admin</strong> y ya no se
                mostrará públicamente.
              </p>
            </div>

            <form action={deleteFormAction} className="flex justify-end gap-3 pt-2">
              <input type="hidden" name="target_comment_id" value={deleteModalComment.id} />
              <button
                type="button"
                onClick={() => setDeleteModalComment(null)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={isDeletePending}
                className="px-6 py-2.5 bg-[#7A1220] hover:bg-[#a01a2b] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isDeletePending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SÍ, ELIMINAR'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
