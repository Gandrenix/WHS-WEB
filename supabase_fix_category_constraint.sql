-- Wiener Hound Studios (WHS) - Fix: constraint de categoría desactualizado
-- Script ADITIVO y seguro de correr las veces que sea.
--
-- La tabla `projects` tiene un CHECK constraint que solo permitía
-- ('manga', 'anime', 'visual-novel', 'apps-software') como categoría válida.
-- Ahora la app usa Apps, Animaciones, Visual Novels y Games -- este script
-- actualiza el constraint para permitir los valores nuevos, y deja los
-- valores viejos ('manga', 'anime') permitidos también, para no romper
-- ninguna obra ya guardada con esas categorías.

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;

ALTER TABLE projects ADD CONSTRAINT projects_category_check
  CHECK (category IN ('apps-software', 'animaciones', 'visual-novel', 'games', 'manga', 'anime'));
