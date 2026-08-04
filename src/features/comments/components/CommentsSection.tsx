'use client';

// Orquestador de la sección de comentarios. Se pasa como referencia de
// componente (ComponentType<CommentsSectionShape>) desde la página hacia
// document-reader, igual que ChapterBookmarkButton, para no violar
// boundaries feature->feature.
//
// Este componente NO trae su propio max-width/padding horizontal: dentro de
// MarkdownReader queda anidado en su <article max-w-4xl px-6 sm:px-12>, y
// heredar ese ancho evita doble indentación. Para los visores con layout
// propio (VideoPlayer/GalleryViewer/PdfReader/ficha técnica, que no comparten
// ese contenedor) es DocumentReaderContainer quien lo envuelve en un
// max-w-4xl mx-auto px-6 sm:px-12 al llamarlo. Sí trae su propio borde
// superior + espaciado vertical, para separarse visualmente del contenido
// de cualquier visor sin integración a medida por viewer.
import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { MessageCircle, Loader2 } from 'lucide-react';
import {
  fetchCommentsAction,
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
  toggleReactionAction,
} from '../actions/comments.actions';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import type { CommentThread, CommentWithAuthor } from '@/entities/comment';
import { createClient } from '@/shared/lib/supabase/client';
import type { Database } from '@/shared/types/database.types';

const DELETED_PLACEHOLDER = '[comentario eliminado]';

type CommentRow = Database['public']['Tables']['comments']['Row'];

export interface CommentsSectionProps {
  projectId: string;
  /** null = comentarios generales de la obra; N = capítulo puntual (posicional). */
  chapterNumber: number | null;
  chapterTitle?: string | null;
  /** Id del usuario con sesión activa, resuelto por la página (ver app/categorias/[id]/page.tsx). */
  currentUserId?: string | null;
}

export function CommentsSection({ projectId, chapterNumber, chapterTitle, currentUserId }: CommentsSectionProps) {
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchCommentsAction({ projectId, chapterNumber, currentUserId }).then((result) => {
      if (cancelled) return;
      setThreads(result.threads);
      setHasMore(result.hasMore);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, chapterNumber]);

  // Realtime: comentarios que publica OTRO usuario aparecen sin recargar ni
  // cambiar de capítulo. Requiere que `comments` esté agregada a la
  // publicación `supabase_realtime` (ver supabase_comments_phase6.sql).
  // Los "me gusta" no llevan realtime a propósito (se refrescan al recargar),
  // para no abrir un segundo canal por esta fase opcional.
  useEffect(() => {
    const supabase = createClient();

    const isSameView = (row: CommentRow) =>
      row.project_id === projectId && row.chapter_number === chapterNumber;

    const enrichWithAuthor = async (row: CommentRow): Promise<CommentWithAuthor> => {
      const { data: authorRow } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', row.user_id)
        .maybeSingle();

      return { ...row, author: authorRow ?? null, reactionCount: 0, viewerHasReacted: false };
    };

    const handleInsert = async (row: CommentRow) => {
      if (!isSameView(row)) return;
      const enriched = await enrichWithAuthor(row);

      if (!row.parent_id) {
        setThreads((prev) => {
          if (prev.some((t) => t.id === row.id)) return prev;
          return [{ ...enriched, replies: [] }, ...prev];
        });
      } else {
        setThreads((prev) => {
          const alreadyPresent = prev.some((t) => t.replies.some((r) => r.id === row.id));
          if (alreadyPresent) return prev;
          return prev.map((t) => (t.id === row.parent_id ? { ...t, replies: [...t.replies, enriched] } : t));
        });
      }
    };

    const handleUpdate = (row: CommentRow) => {
      if (!isSameView(row)) return;
      const nextBody = row.is_deleted ? DELETED_PLACEHOLDER : row.body;

      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === row.id) {
            return { ...thread, body: nextBody, is_deleted: row.is_deleted, updated_at: row.updated_at };
          }
          return {
            ...thread,
            replies: thread.replies.map((r) =>
              r.id === row.id ? { ...r, body: nextBody, is_deleted: row.is_deleted, updated_at: row.updated_at } : r
            ),
          };
        })
      );
    };

    const channel = supabase
      .channel(`comments-project-${projectId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `project_id=eq.${projectId}` },
        (payload) => {
          handleInsert(payload.new as CommentRow);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'comments', filter: `project_id=eq.${projectId}` },
        (payload) => {
          handleUpdate(payload.new as CommentRow);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, chapterNumber]);

  const loadMore = () => {
    startTransition(async () => {
      const result = await fetchCommentsAction({ projectId, chapterNumber, offset: threads.length, currentUserId });
      setThreads((prev) => [...prev, ...result.threads]);
      setHasMore(result.hasMore);
    });
  };

  const updateCommentInState = (updated: CommentWithAuthor) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === updated.id) return { ...thread, ...updated };
        if (thread.replies.some((r) => r.id === updated.id)) {
          return {
            ...thread,
            replies: thread.replies.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
          };
        }
        return thread;
      })
    );
  };

  const markDeletedInState = (commentId: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === commentId) {
          return { ...thread, is_deleted: true, body: DELETED_PLACEHOLDER };
        }
        return {
          ...thread,
          replies: thread.replies.map((r) =>
            r.id === commentId ? { ...r, is_deleted: true, body: DELETED_PLACEHOLDER } : r
          ),
        };
      })
    );
  };

  const handleCreate = async (body: string) => {
    const result = await createCommentAction({ projectId, chapterNumber, chapterTitle, parentId: null, body });
    if (result.error) return { error: result.error };
    if (result.comment) {
      setThreads((prev) => [{ ...result.comment!, replies: [] }, ...prev]);
    }
    return {};
  };

  const handleReply = async (parentId: string, body: string) => {
    const result = await createCommentAction({ projectId, chapterNumber, chapterTitle, parentId, body });
    if (result.error) return { error: result.error };
    if (result.comment) {
      const reply = result.comment;
      setThreads((prev) =>
        prev.map((thread) => (thread.id === parentId ? { ...thread, replies: [...thread.replies, reply] } : thread))
      );
    }
    return {};
  };

  const handleEdit = async (commentId: string, body: string) => {
    const result = await updateCommentAction(commentId, body);
    if (result.error) return { error: result.error };
    if (result.comment) updateCommentInState(result.comment);
    return {};
  };

  const handleDelete = async (commentId: string) => {
    const result = await deleteCommentAction(commentId);
    if (result.error) return { error: result.error };
    markDeletedInState(commentId);
    return {};
  };

  // Optimista: cambia el corazón/contador de inmediato y revierte si el
  // server action falla (ej. la sesión expiró justo en ese momento).
  const toggleReactionInState = (commentId: string, reacted: boolean) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === commentId) {
          return {
            ...thread,
            viewerHasReacted: reacted,
            reactionCount: (thread.reactionCount ?? 0) + (reacted ? 1 : -1),
          };
        }
        return {
          ...thread,
          replies: thread.replies.map((r) =>
            r.id === commentId
              ? { ...r, viewerHasReacted: reacted, reactionCount: (r.reactionCount ?? 0) + (reacted ? 1 : -1) }
              : r
          ),
        };
      })
    );
  };

  const handleToggleReaction = async (commentId: string) => {
    // Determina el estado ANTES de togglear, para poder revertir si falla.
    const current = threads
      .flatMap((t) => [t, ...t.replies])
      .find((c) => c.id === commentId);
    const wasReacted = current?.viewerHasReacted ?? false;

    toggleReactionInState(commentId, !wasReacted);

    const result = await toggleReactionAction(commentId);
    if (result.error) {
      toggleReactionInState(commentId, wasReacted);
      return { error: result.error };
    }
    return {};
  };

  return (
    <section className="mt-16 pt-10 border-t border-white/15 font-mono text-[#F2EDE4]">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-[#C084FC]" />
        <h2 className="text-lg font-black uppercase tracking-tight text-white">
          {chapterNumber ? 'Comentarios de esta sección' : 'Comentarios'}
        </h2>
      </div>

      {currentUserId ? (
        <CommentForm onSubmit={handleCreate} placeholder="Comparte tu opinión sobre esta obra..." submitLabel="Publicar" />
      ) : (
        <div className="mb-6 p-4 rounded-xl border border-white/15 bg-black/40 text-sm font-sans text-[#F2EDE4]/70 flex items-center justify-between flex-wrap gap-3">
          <span>Inicia sesión para dejar un comentario.</span>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-lg bg-[#8B2FE0] hover:bg-[#C084FC] text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Iniciar sesión
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10 text-[#F2EDE4]/50">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="mt-6">
          <CommentList
            threads={threads}
            currentUserId={currentUserId}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleReaction={handleToggleReaction}
          />
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={isPending}
          className="mt-6 w-full py-3 rounded-xl border border-white/15 bg-black/40 hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-[#F2EDE4]/70 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            'Cargar más comentarios'
          )}
        </button>
      )}
    </section>
  );
}
