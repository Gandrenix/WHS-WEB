-- Wiener Hound Studios (WHS) - User Accounts, Favorites & Reading Progress
-- COPY AND PASTE EVERYTHING BELOW INTO THE SUPABASE SQL EDITOR
--
-- Este script es ADITIVO: no toca las tablas projects/chapters/content_assets
-- ya creadas por supabase_definitive_schema.sql. Se puede correr varias veces
-- sin duplicar nada (usa IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).

-- ==========================================
-- 1. PROFILES (extiende auth.users con rol y datos públicos)
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text,
    avatar_url text,
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Crea automáticamente un perfil cuando alguien se registra (email/password o Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: crea el perfil de cuentas que ya existían antes de este script (incluida la de admin).
-- Incluye avatar_url desde raw_user_meta_data (Google, etc.) para que la cuenta
-- ya tenga la foto de perfil por defecto en vez de quedar en null.
INSERT INTO public.profiles (id, display_name, avatar_url, role)
SELECT
  id,
  COALESCE(
    raw_user_meta_data->>'display_name',
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture'),
  'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Restaura el rol de administrador para las cuentas de Wiener Hound Studios
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('andresgarcia2964@gmail.com', 'wienerhoundstudios@gmail.com')
);


-- ==========================================
-- 2. FAVORITES (obras guardadas por el usuario)
-- ==========================================

CREATE TABLE IF NOT EXISTS favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, project_id)
);


-- ==========================================
-- 3. READING_PROGRESS (última posición de lectura por obra)
-- ==========================================

CREATE TABLE IF NOT EXISTS reading_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_number int NOT NULL DEFAULT 1,
    total_chapters int NOT NULL DEFAULT 1,
    status text NOT NULL DEFAULT 'reading' CHECK (status IN ('reading', 'completed')),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, project_id)
);

-- Upsert atómico y seguro: nunca retrocede el capítulo alcanzado ni "des-completa" una obra terminada.
-- Se llama desde el lector (Server Action) cada vez que el usuario abre una obra o cambia de capítulo.
CREATE OR REPLACE FUNCTION public.upsert_reading_progress(
  p_project_id uuid,
  p_chapter_number int,
  p_total_chapters int,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.reading_progress (user_id, project_id, chapter_number, total_chapters, status)
  VALUES (auth.uid(), p_project_id, p_chapter_number, p_total_chapters, p_status)
  ON CONFLICT (user_id, project_id) DO UPDATE SET
    chapter_number = GREATEST(reading_progress.chapter_number, EXCLUDED.chapter_number),
    total_chapters = GREATEST(reading_progress.total_chapters, EXCLUDED.total_chapters),
    status = CASE WHEN reading_progress.status = 'completed' THEN 'completed' ELSE EXCLUDED.status END,
    updated_at = timezone('utc'::text, now());
END;
$$;


-- ==========================================
-- 4. ROW LEVEL SECURITY (cada usuario solo ve/edita lo suyo)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add their own favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own favorites" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own reading progress" ON reading_progress;
DROP POLICY IF EXISTS "Users can insert their own reading progress" ON reading_progress;
DROP POLICY IF EXISTS "Users can update their own reading progress" ON reading_progress;
CREATE POLICY "Users can view their own reading progress" ON reading_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reading progress" ON reading_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reading progress" ON reading_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);


-- ==========================================
-- 5. ÍNDICES DE RENDIMIENTO
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_status ON reading_progress(user_id, status);
