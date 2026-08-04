-- Wiener Hound Studios (WHS) - Fase 6 (opcional) del sistema de comentarios:
-- reacciones (like), notificaciones in-app y Realtime.
-- COPY AND PASTE EVERYTHING BELOW INTO THE SUPABASE SQL EDITOR
--
-- Script aditivo: no toca las tablas de las fases 1-5. Se puede correr varias
-- veces sin duplicar nada. Requiere que supabase_comments_schema.sql ya haya
-- corrido (usa la tabla `comments` y la función `is_admin()`).

-- ==========================================
-- 1. TABLA COMMENT_REACTIONS ("me gusta" — un solo tipo de reacción)
-- ==========================================
-- Se implementa como un like/heart simple (no un picker de emojis con
-- múltiples tipos) para mantener el alcance acotado: un usuario puede
-- reaccionar o no a un comentario, nunca más de una vez (UNIQUE).

CREATE TABLE IF NOT EXISTS comment_reactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON comment_reactions(user_id);

ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view reactions" ON comment_reactions;
DROP POLICY IF EXISTS "Authenticated users can react" ON comment_reactions;
DROP POLICY IF EXISTS "Users can remove own reaction" ON comment_reactions;

-- Lectura pública: el conteo de likes se muestra a cualquiera, con o sin sesión.
CREATE POLICY "Public can view reactions" ON comment_reactions
    FOR SELECT TO public USING (true);

-- Solo se puede reaccionar en nombre propio.
CREATE POLICY "Authenticated users can react" ON comment_reactions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Quitar el like es siempre borrado físico (no hay "reacción eliminada" que
-- mostrar, a diferencia de los comentarios): no hay hilos que proteger.
CREATE POLICY "Users can remove own reaction" ON comment_reactions
    FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- ==========================================
-- 2. TABLA NOTIFICATIONS (in-app, sin email)
-- ==========================================
-- Único disparador implementado: "alguien respondió tu comentario". Queda
-- abierto a más `type` en el futuro (ej. 'admin_deleted', 'mention') sin
-- cambiar el esquema.

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Destinatario: quien VE la notificación.
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- Quien la generó (quien respondió). Nullable por si en el futuro hay
    -- notificaciones generadas por el sistema sin un actor humano.
    actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    type text NOT NULL DEFAULT 'reply',
    comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    chapter_number int,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Actors can create notifications for others" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Cada quien ve SOLO sus propias notificaciones (a diferencia de comments,
-- que son públicos).
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- La pieza clave: el INSERT lo hace quien responde (user_id del destinatario
-- es OTRA persona), así que el WITH CHECK no puede exigir auth.uid()=user_id
-- como en comments. En cambio exige auth.uid()=actor_id: cualquiera puede
-- generar una notificación PARA otro, pero solo puede figurar como actor de
-- sí mismo (no puede fabricar notificaciones atribuidas a un tercero).
CREATE POLICY "Actors can create notifications for others" ON notifications
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

-- Marcar como leída (una o todas) es la única escritura que hace el propio destinatario.
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);


-- ==========================================
-- 3. REALTIME — publicar cambios de `comments`
-- ==========================================
-- Sin esto, `supabase.channel(...).on('postgres_changes', ...)` no recibe
-- ningún evento aunque el cliente se suscriba correctamente. No hace falta
-- para `comment_reactions` ni `notifications` en esta fase (los likes se
-- refrescan al recargar, y las notificaciones se consultan al abrir la
-- campana, no en vivo).

-- Nota: a diferencia del resto del script, esta línea NO es re-ejecutable sin
-- error ("relation is already member of publication") si ya se corrió antes.
-- Si te tira ese error, es inofensivo: significa que ya está habilitado.
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
