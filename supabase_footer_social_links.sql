-- Wiener Hound Studios (WHS) - Enlaces sociales del footer ("ENCUÉNTRANOS":
-- GitHub, LinkedIn, YouTube, SoundCloud, Itch.io). Antes vivían hardcodeados
-- en src/features/landing/components/ResurfaceSection.tsx y
-- src/features/footer/components/Footer.tsx; con este script pasan a ser
-- editables (texto y URL) desde /admin/dashboard/footer.
-- COPY AND PASTE EVERYTHING BELOW INTO THE SUPABASE SQL EDITOR
--
-- Script aditivo, seguro de re-correr: usa IF NOT EXISTS / DROP POLICY IF
-- EXISTS, y el INSERT de semilla solo se ejecuta si la tabla está vacía
-- (WHERE NOT EXISTS), así que no duplica enlaces si corrés el script de nuevo.
-- Requiere que supabase_comments_schema.sql ya haya corrido (usa is_admin()).

-- ==========================================
-- 1. TABLA FOOTER_SOCIAL_LINKS
-- ==========================================

CREATE TABLE IF NOT EXISTS footer_social_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Orden de aparición en el footer (menor = primero).
    position int NOT NULL DEFAULT 0,
    label text NOT NULL,
    url text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_footer_social_links_position ON footer_social_links(position);


-- ==========================================
-- 2. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE footer_social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view footer social links" ON footer_social_links;
DROP POLICY IF EXISTS "Admins can insert footer social links" ON footer_social_links;
DROP POLICY IF EXISTS "Admins can update footer social links" ON footer_social_links;
DROP POLICY IF EXISTS "Admins can delete footer social links" ON footer_social_links;

-- Lectura pública: se muestran en el footer a cualquier visitante, con o sin sesión.
CREATE POLICY "Public can view footer social links" ON footer_social_links
    FOR SELECT TO public USING (true);

-- Escritura reservada a admins, usando el helper is_admin() ya creado en
-- supabase_comments_schema.sql (SECURITY DEFINER, evita recursión de RLS).
CREATE POLICY "Admins can insert footer social links" ON footer_social_links
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update footer social links" ON footer_social_links
    FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can delete footer social links" ON footer_social_links
    FOR DELETE TO authenticated USING (public.is_admin());


-- ==========================================
-- 3. SEMILLA — migra el contenido que estaba hardcodeado en los componentes
-- ==========================================
-- Solo inserta si la tabla está completamente vacía, para que este script
-- se pueda re-correr sin duplicar enlaces.

INSERT INTO footer_social_links (position, label, url)
SELECT * FROM (VALUES
  (1, 'GitHub', 'https://github.com'),
  (2, 'LinkedIn', 'https://linkedin.com'),
  (3, 'YouTube', 'https://youtube.com'),
  (4, 'SoundCloud', 'https://soundcloud.com'),
  (5, 'Itch.io', 'https://itch.io')
) AS seed(position, label, url)
WHERE NOT EXISTS (SELECT 1 FROM footer_social_links);
