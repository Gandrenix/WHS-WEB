'use server';

// Server Actions de la feature `notifications`. Mismo patrón que el resto
// del codebase: el repositorio del entity (`entities/notification/server.ts`)
// es solo lectura; la escritura (marcar como leída) vive acá, resolviendo
// `auth.getUser()` en cada action. La creación de una notificación NO pasa
// por acá — ocurre dentro de `createCommentAction` en `features/comments`,
// en el momento en que se publica una respuesta.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { getNotificationsForUser } from '@/entities/notification/server';
import type { GetNotificationsResult } from '@/entities/notification';

export async function fetchNotificationsAction(offset = 0): Promise<GetNotificationsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { notifications: [], hasMore: false };

  return getNotificationsForUser(user.id, { offset });
}

export interface MarkNotificationReadResult {
  error?: string;
}

export async function markNotificationReadAction(notificationId: string): Promise<MarkNotificationReadResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'No autorizado.' };

    const { error: dbError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (dbError) return { error: dbError.message };

    return {};
  } catch {
    return { error: 'No se pudo marcar la notificación como leída.' };
  }
}

export async function markAllNotificationsReadAction(): Promise<MarkNotificationReadResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'No autorizado.' };

    const { error: dbError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (dbError) return { error: dbError.message };

    // 'layout' porque el conteo inicial se resuelve en app/layout.tsx (raíz
    // compartida por todas las rutas), no en una página puntual.
    revalidatePath('/', 'layout');

    return {};
  } catch {
    return { error: 'No se pudieron marcar las notificaciones como leídas.' };
  }
}
