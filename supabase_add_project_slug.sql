-- Añade una URL legible ("slug") a cada proyecto — hasta ahora /categorias/[id] usaba
-- directamente el UUID de la fila, así que cada obra se compartía como un link largo e
-- ilegible (ej. /categorias/f87d0457-088c-4da8-9c35-6acb9ba544a2) en vez de algo como
-- /categorias/cuatro-paredes. El UUID sigue existiendo igual (es la PK real, y las tablas
-- de capítulos/comentarios/favoritos siguen apuntando a él) — el slug es solo la puerta de
-- entrada pública.

-- unaccent() quita tildes ("Ortodoncía" -> "ortodoncia") para armar el slug.
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug text;

-- Backfill de las filas existentes: título en minúsculas, sin tildes, espacios y símbolos
-- convertidos en guiones. Si dos títulos generan el mismo slug (ej. "Ortodoncia" x2), a la
-- segunda fila en adelante se le agrega un sufijo corto tomado de su propio UUID para que
-- cada slug quede único sin intervención manual.
WITH base AS (
  SELECT
    id,
    row_number() OVER (PARTITION BY
      regexp_replace(
        regexp_replace(lower(unaccent(title)), '[^a-z0-9]+', '-', 'g'),
        '(^-|-$)', '', 'g'
      )
      ORDER BY created_at
    ) AS n,
    regexp_replace(
      regexp_replace(lower(unaccent(title)), '[^a-z0-9]+', '-', 'g'),
      '(^-|-$)', '', 'g'
    ) AS base_slug
  FROM projects
)
UPDATE projects p
SET slug = CASE WHEN base.n = 1 THEN base.base_slug ELSE base.base_slug || '-' || substring(p.id::text, 1, 6) END
FROM base
WHERE p.id = base.id AND (p.slug IS NULL OR p.slug = '');

ALTER TABLE projects ALTER COLUMN slug SET NOT NULL;
ALTER TABLE projects ADD CONSTRAINT projects_slug_unique UNIQUE (slug);
