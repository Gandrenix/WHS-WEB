'use client';

// Un comentario + sus respuestas (un nivel de anidamiento, igual que el
// repositorio los agrupa). Controla su propio modo de vista (viendo /
// editando / respondiendo); las mutaciones reales (onEdit/onReply/onDelete)
// las resuelve CommentsSection, que es quien tiene el estado de la lista.
import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { CommentThread, CommentWithAuthor } from '@/entities/comment';
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime';
import { AvatarImage } from '@/shared/ui/AvatarImage';
import { CommentForm } from './CommentForm';

export interface CommentItemProps {
  comment: CommentThread | CommentWithAuthor;
  isReply?: boolean;
  currentUserId?: string | null;
  /** Solo se ofrece en comentarios raíz (un nivel de respuestas). */
  onReply?: (parentId: string, body: string) => Promise<{ error?: string }>;
  onEdit?: (commentId: string, body: string) => Promise<{ error?: string }>;
  onDelete?: (commentId: string) => Promise<{ error?: string }>;
  onToggleReaction?: (commentId: string) => Promise<{ error?: string }>;
  /**
   * Nombre del autor del comentario raíz de este hilo, para mostrar el
   * "@mención" en una respuesta — solo lo pasa el CommentItem raíz a sus
   * respuestas, y solo cuando el autor de la respuesta es DISTINTO del
   * autor raíz (nunca te mencionás a vos mismo al responderte).
   */
  mentionAuthorName?: string;
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function CommentItem({
  comment,
  isReply = false,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
  mentionAuthorName,
}: CommentItemProps) {
  const [mode, setMode] = useState<'view' | 'editing' | 'replying'>('view');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const authorName = comment.author?.display_name || 'Usuario';
  const replies = 'replies' in comment ? comment.replies : [];
  const isOwn = Boolean(currentUserId && comment.user_id === currentUserId);
  const wasEdited = comment.updated_at !== comment.created_at;
  const reactionCount = comment.reactionCount ?? 0;
  const viewerHasReacted = comment.viewerHasReacted ?? false;

  const handleEditSubmit = async (body: string) => {
    if (!onEdit) return {};
    const result = await onEdit(comment.id, body);
    if (!result.error) setMode('view');
    return result;
  };

  const handleReplySubmit = async (body: string) => {
    if (!onReply) return {};
    const result = await onReply(comment.id, body);
    if (!result.error) setMode('view');
    return result;
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (typeof window !== 'undefined' && !window.confirm('¿Eliminar este comentario?')) return;
    setIsDeleting(true);
    await onDelete(comment.id);
    setIsDeleting(false);
  };

  const handleToggleReaction = async () => {
    if (!onToggleReaction || !currentUserId || isReacting) return;
    setIsReacting(true);
    await onToggleReaction(comment.id);
    setIsReacting(false);
  };

  return (
    <div>
      <div
        className={
          isReply
            ? 'flex gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-3'
            : 'flex gap-3'
        }
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#8B2FE0]/20 border border-white/15 shrink-0 flex items-center justify-center text-xs font-mono font-bold text-[#C084FC]">
          <AvatarImage
            src={comment.author?.avatar_url}
            alt={authorName}
            fallback={initials(authorName)}
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-white">{authorName}</span>
            <span className="text-[10px] font-mono text-[#F2EDE4]/40">{formatRelativeTime(comment.created_at)}</span>
            {wasEdited && !comment.is_deleted && (
              <span className="text-[10px] font-mono text-[#F2EDE4]/30 italic">(editado)</span>
            )}
          </div>

          {/* Solo aparece en respuestas dirigidas a OTRO usuario (nunca en
              autorespuestas): deja claro a quién le está contestando este
              mensaje dentro del hilo. */}
          {mentionAuthorName && (
            <div className="mt-0.5 text-[11px] font-mono font-bold text-[#7ED957]">@{mentionAuthorName}</div>
          )}

          {mode === 'editing' ? (
            <CommentForm
              initialValue={comment.body}
              onSubmit={handleEditSubmit}
              onCancel={() => setMode('view')}
              submitLabel="Guardar"
              clearOnSuccess={false}
              autoFocus
            />
          ) : (
            <p
              className={`mt-1 text-sm font-sans leading-relaxed whitespace-pre-wrap break-words ${
                comment.is_deleted ? 'italic text-[#F2EDE4]/40' : 'text-[#F2EDE4]/90'
              }`}
            >
              {comment.body}
            </p>
          )}

          {!comment.is_deleted && mode === 'view' && (
            <div className="mt-1.5 flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#F2EDE4]/40">
              <button
                type="button"
                onClick={handleToggleReaction}
                disabled={!currentUserId || isReacting}
                title={currentUserId ? undefined : 'Inicia sesión para reaccionar'}
                className={`flex items-center gap-1 transition-colors normal-case tracking-normal ${
                  viewerHasReacted ? 'text-[#C084FC]' : 'hover:text-[#C084FC]'
                } ${currentUserId ? 'cursor-pointer' : 'cursor-default'} disabled:opacity-60`}
              >
                <Heart className={`w-3 h-3 ${viewerHasReacted ? 'fill-current' : ''}`} />
                {reactionCount > 0 && <span>{reactionCount}</span>}
              </button>

              {!isReply && onReply && currentUserId && (
                <button
                  type="button"
                  onClick={() => setMode('replying')}
                  className="hover:text-[#C084FC] transition-colors cursor-pointer"
                >
                  Responder
                </button>
              )}
              {isOwn && onEdit && (
                <button
                  type="button"
                  onClick={() => setMode('editing')}
                  className="hover:text-[#C084FC] transition-colors cursor-pointer"
                >
                  Editar
                </button>
              )}
              {isOwn && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminando…' : 'Eliminar'}
                </button>
              )}
            </div>
          )}

          {mode === 'replying' && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReplySubmit}
                onCancel={() => setMode('view')}
                placeholder={`Responder a ${authorName}...`}
                submitLabel="Responder"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        // Línea de hilo a la izquierda: agrupa visualmente todas las
        // respuestas de ESTE comentario raíz y las separa con claridad de
        // otros hilos (otros comentarios raíz) en la lista.
        <div className="mt-3 ml-4 sm:ml-6 pl-4 sm:pl-6 border-l-2 border-[#8B2FE0]/20 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleReaction={onToggleReaction}
              mentionAuthorName={reply.user_id !== comment.user_id ? authorName : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
