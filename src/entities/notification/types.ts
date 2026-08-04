// Nota de arquitectura (mismo criterio que entities/comment/types.ts):
// `NotificationActor` duplica a propósito el shape de `entities/profile`.Profile
// en vez de importarlo — boundaries prohíbe imports entre entidades, y el
// repositorio hace un JOIN directo con `profiles` vía Supabase.

export interface NotificationActor {
  display_name: string | null;
  avatar_url: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  /** Único valor emitido hoy: 'reply' (alguien respondió tu comentario). */
  type: string;
  comment_id: string | null;
  project_id: string | null;
  /** null = la respuesta fue a un comentario general de la obra. */
  chapter_number: number | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationWithContext extends Notification {
  actor: NotificationActor | null;
  project: { title: string } | null;
}

export interface GetNotificationsResult {
  notifications: NotificationWithContext[];
  hasMore: boolean;
}
