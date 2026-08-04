-- Tabla para el formulario de contacto ("HABLEMOS DE TU PROYECTO").
-- Script aditivo: no modifica ninguna tabla existente, se puede correr solo.

CREATE TABLE IF NOT EXISTS contact_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    -- true si el envío disparó correctamente el correo vía Resend; false si el
    -- mensaje quedó guardado pero el correo falló (para poder revisarlo manualmente).
    email_sent boolean NOT NULL DEFAULT false,
    -- true una vez que un admin lo marcó como leído/atendido en el dashboard.
    is_read boolean NOT NULL DEFAULT false
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON contact_messages;

-- Cualquier visitante (autenticado o no) puede enviar un mensaje de contacto.
CREATE POLICY "Public can insert contact messages" ON contact_messages
    FOR INSERT TO public WITH CHECK (true);

-- Solo lectura/edición pública por ahora (igual que 'projects' en este proyecto,
-- que no filtra por rol a nivel de RLS); el filtrado real de quién ve la bandeja
-- ocurre en la UI del admin (ruta /admin/dashboard, ya protegida por middleware).
CREATE POLICY "Admins can view contact messages" ON contact_messages
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins can update contact messages" ON contact_messages
    FOR UPDATE TO public USING (true);
