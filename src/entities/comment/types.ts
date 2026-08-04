// Nota de arquitectura: esta entidad no importa `entities/profile` ni
// `entities/project` (las reglas de boundaries prohíben imports entre
// entidades). El shape de `CommentAuthor` está duplicado a propósito —refleja
// las mismas columnas que `entities/profile`.Profile, pero como tipo local—
// porque el repositorio hace un JOIN directo con `profiles` vía Supabase
// (mucho más eficiente que resolver el autor de cada comentario por separado
// desde la capa app/features, como sí hace `entities/library` con projects).

export interface CommentAuthor {
  display_name: string | null;
  avatar_url: string | null;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  parent_id: string | null;
  /** null = comentario general de la obra; 1..n = capítulo puntual (posicional). */
  chapter_number: number | null;
  /** Snapshot del título del capítulo al momento de comentar. */
  chapter_title: string | null;
  body: string;
  is_deleted: boolean;
  deleted_by_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends Comment {
  author: CommentAuthor | null;
  /**
   * Cantidad de "me gusta" y si el usuario que pidió la lista ya reaccionó.
   * Opcionales porque solo `getCommentsForProject` los calcula (requiere un
   * segundo query a `comment_reactions`); `getCommentsForModeration`, que
   * usa este mismo tipo vía `CommentModerationRow`, no los necesita.
   */
  reactionCount?: number;
  viewerHasReacted?: boolean;
}

/** Comentario raíz con sus respuestas ya agrupadas (un solo nivel de anidamiento). */
export interface CommentThread extends CommentWithAuthor {
  replies: CommentWithAuthor[];
}

export interface GetCommentsResult {
  threads: CommentThread[];
  hasMore: boolean;
}

/**
 * Fila para la vista de moderación del admin (sección COMUNIDAD): un
 * comentario de CUALQUIER obra/capítulo, sin agrupar en hilos y sin
 * redactar el body aunque esté is_deleted (el admin necesita ver el
 * contenido real para poder moderar). Incluye el título de la obra porque
 * la lista mezcla comentarios de proyectos distintos.
 */
export interface CommentModerationRow extends CommentWithAuthor {
  project: { title: string } | null;
}

export interface GetCommentsForModerationResult {
  comments: CommentModerationRow[];
  hasMore: boolean;
}
