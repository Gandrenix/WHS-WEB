-- Wiener Hound Studios (WHS) - Sistema de comentarios / comunidad
-- COPY AND PASTE EVERYTHING BELOW INTO THE SUPABASE SQL EDITOR
--
-- Script aditivo: no toca projects/chapters/content_assets/favorites/
-- reading_progress ya creadas por los scripts anteriores. Se puede correr
-- varias veces sin duplicar nada (usa IF NOT EXISTS / OR REPLACE /
-- DROP POLICY IF EXISTS). Ver PLAN_COMUNIDAD.md para el razonamiento
-- completo detrás de cada decisión de este script.

-- ==========================================
-- 1. FIX PREVIO: RLS de 'profiles' bloquea ver perfiles ajenos
-- ==========================================
-- La policy actual (`USING (auth.uid() = id)`) solo deja a cada usuario ver
-- su propio perfil. Un JOIN de comments -> profiles para mostrar nombre/avatar
-- de OTROS comentaristas devolvería vacío para todos menos el dueño de la
-- sesión. Se abre el SELECT a lectura pública (patrón estándar de Supabase:
-- 'profiles' existe separada de 'auth.users' justamente para exponer datos
-- públicos). No otorga ningún permiso adicional de escritura.
--
-- Nota: esto expone la columna 'role', o sea que cualquiera puede ver qué
-- cuentas son admin. Es solo visibilidad de un dato, no un permiso: la
-- protección real de las rutas /admin sigue en el middleware y en la RLS de
-- cada tabla protegida.

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT TO public USING (true);


-- ==========================================
-- 2. TABLA COMMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- OJO: referencia a profiles(id), NO a auth.users(id). PostgREST solo puede
    -- resolver el JOIN embebido `comments -> profiles` (necesario para traer
    -- nombre/avatar del autor en una sola consulta) si existe una FK DIRECTA
    -- entre ambas tablas. profiles.id ya referencia auth.users(id) 1:1 (todo
    -- usuario tiene perfil por el trigger handle_new_user() + el backfill), así
    -- que esto no cambia la integridad real, solo la hace visible a PostgREST.
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,

    -- NULL = comentario general de la obra (PDF, video, galería, ficha técnica).
    -- 1..n = comentario de un capítulo puntual. La identidad de "capítulo" es
    -- POSICIONAL (activeChapterIndex + 1), igual que ya usan chapter_bookmarks
    -- y reading_progress, porque los capítulos no existen como filas propias:
    -- se parsean en runtime desde projects.markdown_content.
    chapter_number int,
    -- Snapshot del título al momento de comentar, para poder detectar/reparar
    -- desajustes si el admin reordena capítulos después (ver PLAN_COMUNIDAD.md §1.1).
    chapter_title text,

    body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),

    -- Borrado suave: si se hiciera DELETE físico de un comentario padre, el
    -- ON DELETE CASCADE de parent_id se llevaría todas sus respuestas y
    -- rompería el hilo. Con is_deleted se muestra "[comentario eliminado]" y
    -- las respuestas sobreviven.
    is_deleted boolean NOT NULL DEFAULT false,
    -- Distingue "el autor lo borró" de "un admin lo moderó", para la vista
    -- de COMUNIDAD del panel de administración.
    deleted_by_admin boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_thread ON comments(project_id, chapter_number, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);


-- ==========================================
-- 3. HELPER is_admin() — SECURITY DEFINER para evitar recursión de RLS
-- ==========================================
-- Sin SECURITY DEFINER, una policy de 'comments' que consulte 'profiles'
-- quedaría sujeta a la propia RLS de 'profiles' en cada evaluación; con
-- SECURITY DEFINER la función corre con los permisos de quien la definió,
-- evitando ese ciclo.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ==========================================
-- 4. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert own comments" ON comments;
DROP POLICY IF EXISTS "Authors can update own comments" ON comments;
DROP POLICY IF EXISTS "Admins can moderate comments" ON comments;
DROP POLICY IF EXISTS "Authors and admins can delete comments" ON comments;

-- Lectura pública: cualquier visitante ve los comentarios, con o sin sesión.
CREATE POLICY "Public can view comments" ON comments
    FOR SELECT TO public USING (true);

-- Solo usuarios con sesión pueden publicar, y únicamente en su propio nombre
-- (WITH CHECK impide insertar comentarios haciéndose pasar por otro user_id,
-- incluso si alguien saltea el Server Action y llama directo a la API).
CREATE POLICY "Authenticated users can insert own comments" ON comments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- El autor puede editar su propio comentario (body) o borrarlo (is_deleted).
CREATE POLICY "Authors can update own comments" ON comments
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Los admins pueden moderar (marcar is_deleted/deleted_by_admin) cualquier comentario.
CREATE POLICY "Admins can moderate comments" ON comments
    FOR UPDATE TO authenticated USING (public.is_admin());

-- DELETE físico reservado para el autor o un admin (uso interno; el flujo
-- normal de borrado usa UPDATE con is_deleted, no DELETE).
CREATE POLICY "Authors and admins can delete comments" ON comments
    FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());
