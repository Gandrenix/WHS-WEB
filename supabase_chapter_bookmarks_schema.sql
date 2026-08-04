-- Wiener Hound Studios (WHS) - Chapter Bookmarks
-- Script ADITIVO: no toca nada de lo ya creado por los scripts anteriores.
-- Permite guardar un capítulo específico dentro de una obra (distinto de "favoritos",
-- que guarda la obra completa).

CREATE TABLE IF NOT EXISTS chapter_bookmarks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_number int NOT NULL,
    chapter_title text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, project_id, chapter_number)
);

ALTER TABLE chapter_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chapter bookmarks" ON chapter_bookmarks;
DROP POLICY IF EXISTS "Users can add their own chapter bookmarks" ON chapter_bookmarks;
DROP POLICY IF EXISTS "Users can remove their own chapter bookmarks" ON chapter_bookmarks;

CREATE POLICY "Users can view their own chapter bookmarks" ON chapter_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add their own chapter bookmarks" ON chapter_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own chapter bookmarks" ON chapter_bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chapter_bookmarks_user ON chapter_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_bookmarks_project ON chapter_bookmarks(user_id, project_id);
