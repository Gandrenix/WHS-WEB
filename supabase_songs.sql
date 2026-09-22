-- Wiener Hound Studios (WHS) - Playlist del reproductor del header. Antes la
-- música de ambiente era un único MP3 hardcodeado en
-- src/features/navbar/hooks/useLogoAudio.ts (`/audio/musica-fondo.mp3`). Con
-- este script pasa a ser una playlist completa, editable (subir/quitar
-- canciones, elegir cuál es la "principal") desde /admin/dashboard/musica.
-- Los archivos .mp3 en sí viven en Storage (bucket `whs-media`, carpeta
-- `songs/`) — esta tabla solo guarda metadata + la URL pública.
-- COPY AND PASTE EVERYTHING BELOW INTO THE SUPABASE SQL EDITOR
--
-- Script aditivo, seguro de re-correr: usa IF NOT EXISTS / DROP POLICY IF
-- EXISTS. No trae semilla: arranca vacío hasta que se suba una canción desde
-- el admin (mismo criterio que la tabla `projects`).
-- Requiere que supabase_comments_schema.sql ya haya corrido (usa is_admin()).

-- ==========================================
-- 1. TABLA SONGS
-- ==========================================

CREATE TABLE IF NOT EXISTS songs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    artist text,
    -- URL pública en el bucket whs-media (carpeta songs/), no un archivo del repo.
    audio_url text NOT NULL,
    -- Orden de aparición en la playlist (menor = primero).
    position int NOT NULL DEFAULT 0,
    -- La canción que suena por defecto al primer clic en el logo. Solo una a
    -- la vez (ver el índice único parcial abajo).
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_songs_position ON songs(position);

-- Garantiza que como mucho una canción tenga is_default = true (un índice
-- único parcial, no un CHECK: un CHECK no puede comparar contra otras filas).
CREATE UNIQUE INDEX IF NOT EXISTS idx_songs_single_default ON songs (is_default) WHERE is_default = true;


-- ==========================================
-- 2. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view songs" ON songs;
DROP POLICY IF EXISTS "Admins can insert songs" ON songs;
DROP POLICY IF EXISTS "Admins can update songs" ON songs;
DROP POLICY IF EXISTS "Admins can delete songs" ON songs;

-- Lectura pública: el reproductor del header las necesita para cualquier visitante.
CREATE POLICY "Public can view songs" ON songs
    FOR SELECT TO public USING (true);

-- Escritura reservada a admins, usando el helper is_admin() ya creado en
-- supabase_comments_schema.sql (SECURITY DEFINER, evita recursión de RLS).
CREATE POLICY "Admins can insert songs" ON songs
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update songs" ON songs
    FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can delete songs" ON songs
    FOR DELETE TO authenticated USING (public.is_admin());
