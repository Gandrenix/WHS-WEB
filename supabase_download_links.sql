-- Añade la columna download_links a projects: array JSON de enlaces externos
-- de descarga (ej. Google Drive, Dropbox) que el admin puede adjuntar a una
-- obra desde el dashboard, mostrados al lector final como una zona de
-- descarga. Cada elemento tiene forma { "label": string, "url": string }.
-- Idempotente: seguro de correr más de una vez.

alter table public.projects
  add column if not exists download_links jsonb;
