import 'server-only';
import { createClient } from '@/shared/lib/supabase/server';
import type { NotificationWithContext, GetNotificationsResult } from '../types';

export interface GetNotificationsOptions {
  limit?: number;
  offset?: number;
}

// Notificaciones de UN usuario (nunca de otro: la RLS "Users can view own
// notifications" ya lo garantiza, pero igual se filtra acá por claridad y
// para poder usar el mismo query desde un Server Action que ya resolvió el
// userId de la sesión).
export async function getNotificationsForUser(
  userId: string,
  { limit = 20, offset = 0 }: GetNotificationsOptions = {}
): Promise<GetNotificationsResult> {
  try {
    const supabase = await createClient();

    // El hint `!actor_id` es obligatorio acá: `notifications` tiene DOS
    // columnas que referencian `profiles` (`user_id` y `actor_id`), así que
    // `profiles(...)` a secas es una relación ambigua para PostgREST — sin
    // el hint, esta consulta fallaba en silencio (devolvía `error` y por
    // eso la lista salía vacía aunque el conteo de no leídas, que no hace
    // ningún JOIN, sí funcionaba bien).
    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor:profiles!actor_id(display_name, avatar_url), project:projects(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit);

    if (error) {
      console.warn('getNotificationsForUser: error al consultar notificaciones', error.message);
    }
    if (error || !data) return { notifications: [], hasMore: false };

    const hasMore = data.length > limit;
    const notifications = (hasMore ? data.slice(0, limit) : data) as unknown as NotificationWithContext[];

    return { notifications, hasMore };
  } catch {
    return { notifications: [], hasMore: false };
  }
}

// Conteo de no leídas, para el badge de la campana. Se resuelve server-side
// en el layout para el primer render (sin parpadeo en 0), y se refresca
// client-side al abrir/interactuar con el dropdown.
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    const supabase = await createClient();

    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return count ?? 0;
  } catch {
    return 0;
  }
}
