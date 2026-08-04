import type { CommentThread } from '@/entities/comment';
import { CommentItem } from './CommentItem';

export interface CommentListProps {
  threads: CommentThread[];
  currentUserId?: string | null;
  onReply?: (parentId: string, body: string) => Promise<{ error?: string }>;
  onEdit?: (commentId: string, body: string) => Promise<{ error?: string }>;
  onDelete?: (commentId: string) => Promise<{ error?: string }>;
  onToggleReaction?: (commentId: string) => Promise<{ error?: string }>;
}

export function CommentList({ threads, currentUserId, onReply, onEdit, onDelete, onToggleReaction }: CommentListProps) {
  if (threads.length === 0) {
    return (
      <p className="text-sm font-sans text-[#F2EDE4]/50 text-center py-8">
        Todavía no hay comentarios. Sé el primero en dejar uno.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {threads.map((thread) => (
        <CommentItem
          key={thread.id}
          comment={thread}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleReaction={onToggleReaction}
        />
      ))}
    </div>
  );
}
