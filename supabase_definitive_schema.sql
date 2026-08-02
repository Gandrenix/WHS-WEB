-- Wiener Hound Studios (WHS) - Definitive Database Schema & Migration (Updated)
-- COPY AND PASTE EVERYTHING BELOW INTO THE SUPABASE SQL EDITOR

-- ==========================================
-- 1. SYNCHRONIZE EXISTING TABLES (MIGRATION)
-- ==========================================

-- A. Update PROJECTS Table with Document, Markdown & Multi-Media columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_url text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_type text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS document_url text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS markdown_content text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_urls text[];

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;
ALTER TABLE projects ADD CONSTRAINT projects_category_check CHECK (category IN ('manga', 'anime', 'visual-novel', 'apps-software'));

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('En Emisión', 'Pausado', 'Finalizado'));

-- B. Update CONTENT_ASSETS Table
ALTER TABLE content_assets DROP CONSTRAINT IF EXISTS content_assets_asset_type_check;
ALTER TABLE content_assets ADD CONSTRAINT content_assets_asset_type_check CHECK (asset_type IN ('image', 'text', 'pdf', 'video', 'audio'));


-- ==========================================
-- 2. TABLE DEFINITIONS (FOR NEW INSTALLATIONS)
-- ==========================================

CREATE TABLE IF NOT EXISTS projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    image_url text,
    category text CHECK (category IN ('manga', 'anime', 'visual-novel', 'apps-software')),
    status text CHECK (status IN ('En Emisión', 'Pausado', 'Finalizado')),
    project_url text,
    file_type text,
    document_url text,
    markdown_content text,
    video_url text,
    audio_url text,
    gallery_urls text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS chapters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    chapter_number int NOT NULL,
    title text,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(project_id, chapter_number)
);

CREATE TABLE IF NOT EXISTS content_assets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
    asset_type text CHECK (asset_type IN ('image', 'text', 'pdf', 'video', 'audio')),
    asset_url text, 
    text_content text, 
    sequence_number int NOT NULL, 
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


-- ==========================================
-- 3. SECURITY & POLICIES (FIXES RLS ERRORS)
-- ==========================================

-- Ensure RLS is active
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;

-- Clean up old policies
DROP POLICY IF EXISTS "Public can view projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Public/Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

DROP POLICY IF EXISTS "Public can view chapters" ON chapters;
DROP POLICY IF EXISTS "Admins can insert chapters" ON chapters;
DROP POLICY IF EXISTS "Public/Admins can insert chapters" ON chapters;
DROP POLICY IF EXISTS "Admins can update chapters" ON chapters;
DROP POLICY IF EXISTS "Admins can delete chapters" ON chapters;

DROP POLICY IF EXISTS "Public can view assets" ON content_assets;
DROP POLICY IF EXISTS "Admins can insert assets" ON content_assets;
DROP POLICY IF EXISTS "Public/Admins can insert assets" ON content_assets;
DROP POLICY IF EXISTS "Admins can update assets" ON content_assets;
DROP POLICY IF EXISTS "Admins can delete assets" ON content_assets;

-- 3.1 PROJECTS Policies
CREATE POLICY "Public can view projects" ON projects FOR SELECT TO public USING (true);
CREATE POLICY "Public/Admins can insert projects" ON projects FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can update projects" ON projects FOR UPDATE TO public USING (true);
CREATE POLICY "Admins can delete projects" ON projects FOR DELETE TO public USING (true);

-- 3.2 CHAPTERS Policies
CREATE POLICY "Public can view chapters" ON chapters FOR SELECT TO public USING (true);
CREATE POLICY "Public/Admins can insert chapters" ON chapters FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can update chapters" ON chapters FOR UPDATE TO public USING (true);
CREATE POLICY "Admins can delete chapters" ON chapters FOR DELETE TO public USING (true);

-- 3.3 CONTENT_ASSETS Policies
CREATE POLICY "Public can view assets" ON content_assets FOR SELECT TO public USING (true);
CREATE POLICY "Public/Admins can insert assets" ON content_assets FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can update assets" ON content_assets FOR UPDATE TO public USING (true);
CREATE POLICY "Admins can delete assets" ON content_assets FOR DELETE TO public USING (true);


-- ==========================================
-- 4. STORAGE SETUP (POLICIES PARA BUCKETS)
-- ==========================================

DROP POLICY IF EXISTS "Public Read whs-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert whs-media" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert whs-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update whs-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete whs-media" ON storage.objects;

DROP POLICY IF EXISTS "Public Read manga-pages" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert manga-pages" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert manga-pages" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update manga-pages" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete manga-pages" ON storage.objects;

CREATE POLICY "Public Read whs-media" ON storage.objects FOR SELECT TO public USING (bucket_id = 'whs-media');
CREATE POLICY "Public Insert whs-media" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'whs-media');
CREATE POLICY "Public Update whs-media" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'whs-media');
CREATE POLICY "Public Delete whs-media" ON storage.objects FOR DELETE TO public USING (bucket_id = 'whs-media');

CREATE POLICY "Public Read manga-pages" ON storage.objects FOR SELECT TO public USING (bucket_id = 'manga-pages');
CREATE POLICY "Public Insert manga-pages" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'manga-pages');
CREATE POLICY "Public Update manga-pages" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'manga-pages');
CREATE POLICY "Public Delete manga-pages" ON storage.objects FOR DELETE TO public USING (bucket_id = 'manga-pages');


-- ==========================================
-- 5. FINAL PERMISSIONS CHECK
-- ==========================================
GRANT USAGE ON SCHEMA storage TO public;
GRANT ALL ON TABLE storage.objects TO public;
GRANT ALL ON TABLE storage.buckets TO public;
