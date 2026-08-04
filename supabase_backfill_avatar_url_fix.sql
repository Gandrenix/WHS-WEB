-- Wiener Hound Studios (WHS) - Fix: foto de perfil de Google no aparecía por defecto
-- Script ADITIVO y seguro de correr las veces que sea: solo rellena avatar_url
-- donde está en null, nunca pisa una foto que el usuario ya haya subido a mano.
--
-- Causa raíz: el backfill original de perfiles (en supabase_user_dashboard_schema.sql)
-- creaba la fila en `profiles` solo con id/display_name/role, sin copiar avatar_url
-- desde auth.users.raw_user_meta_data — así que las cuentas de Google que ya
-- existían antes de correr ese script se quedaron con avatar_url = null para siempre,
-- aunque Google sí les manda la foto en el login.

UPDATE public.profiles p
SET avatar_url = COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture')
FROM auth.users u
WHERE p.id = u.id
  AND p.avatar_url IS NULL
  AND COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture') IS NOT NULL;
