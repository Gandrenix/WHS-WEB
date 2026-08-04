-- Wiener Hound Studios (WHS) - Fichas de "espécimen" de la landing (sección
-- STRATA I / "HealthTech & Bioinformática"). Antes vivían hardcodeadas en
-- src/features/landing/components/StrataOneSection.tsx; con este script
-- pasan a ser editables desde /admin/dashboard/especimenes.
-- COPY AND PASTE EVERYTHING BELOW INTO THE SUPABASE SQL EDITOR
--
-- Script aditivo, seguro de re-correr: usa IF NOT EXISTS / DROP POLICY IF
-- EXISTS, y el INSERT de semilla solo se ejecuta si la tabla está vacía
-- (WHERE NOT EXISTS), así que no duplica fichas si corrés el script de nuevo.
-- Requiere que supabase_comments_schema.sql ya haya corrido (usa is_admin()).

-- ==========================================
-- 1. TABLA SPECIMEN_CARDS
-- ==========================================

CREATE TABLE IF NOT EXISTS specimen_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Orden de aparición en la grilla (menor = primero). Se edita a mano
    -- desde el panel, no hay drag-and-drop.
    position int NOT NULL DEFAULT 0,
    cat text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    input_label text NOT NULL,
    output_label text NOT NULL,
    lang_label text NOT NULL,
    status text NOT NULL DEFAULT 'ACTIVO',
    -- Emoji de respaldo: se usa SOLO si no hay image_url subida.
    icon text,
    image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_specimen_cards_position ON specimen_cards(position);


-- ==========================================
-- 2. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE specimen_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view specimen cards" ON specimen_cards;
DROP POLICY IF EXISTS "Admins can insert specimen cards" ON specimen_cards;
DROP POLICY IF EXISTS "Admins can update specimen cards" ON specimen_cards;
DROP POLICY IF EXISTS "Admins can delete specimen cards" ON specimen_cards;

-- Lectura pública: se muestran en la home a cualquier visitante, con o sin sesión.
CREATE POLICY "Public can view specimen cards" ON specimen_cards
    FOR SELECT TO public USING (true);

-- Escritura reservada a admins, usando el helper is_admin() ya creado en
-- supabase_comments_schema.sql (SECURITY DEFINER, evita recursión de RLS).
CREATE POLICY "Admins can insert specimen cards" ON specimen_cards
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update specimen cards" ON specimen_cards
    FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can delete specimen cards" ON specimen_cards
    FOR DELETE TO authenticated USING (public.is_admin());


-- ==========================================
-- 3. SEMILLA — migra el contenido que estaba hardcodeado en el componente
-- ==========================================
-- Solo inserta si la tabla está completamente vacía, para que este script
-- se pueda re-correr sin duplicar fichas.

INSERT INTO specimen_cards (position, cat, title, description, input_label, output_label, lang_label, status, icon)
SELECT * FROM (VALUES
  (1, 'CAT. SC-001', 'SomaCore', 'Motor de somatotipado clínico-genético. Pipeline de análisis fenotípico y biomarcadores.', 'GENOTIPO.RAW', 'SOMATOTIPO.JSON', 'PYTHON / R', 'ACTIVO', '🧬'),
  (2, 'CAT. YM-002', 'YOLO MicroMap', 'Detección automática de colonias bacterianas en placas de Petri mediante visión por computador.', 'PETRISET-v2', 'COLONIA_COUNT', 'YOLOv8 / OPENCV', 'ACTIVO', '🧫'),
  (3, 'CAT. WC-003', 'WienerCalc', 'Motor de cálculo nutricional para encuestas alimentarias, sin depender de formatos de tabla fijos.', 'CSV_FOODDATA', 'CSV / XLSX', 'ELECTRON / REACT / TS', 'ACTIVO', '💻'),
  (4, 'CAT. KR-004', 'Kreo Framework', 'Marco de cumplimiento regulatorio y orquestación de equipos de investigación clínica.', 'RES_8430/93', 'COMPLIANCE', 'NEXT.JS / PRISMA', 'ACTIVO', '📋')
) AS seed(position, cat, title, description, input_label, output_label, lang_label, status, icon)
WHERE NOT EXISTS (SELECT 1 FROM specimen_cards);
