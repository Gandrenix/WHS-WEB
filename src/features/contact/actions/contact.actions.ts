'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { ContactSchema } from '../schemas/contact.schema';

export interface ContactActionResponse {
  error?: string | null;
  success?: boolean;
}

const NOTIFICATION_EMAIL = process.env.CONTACT_NOTIFICATION_EMAIL || 'wienerhoundstudios@gmail.com';

export async function sendContactMessageAction(
  prevState: ContactActionResponse,
  formData: FormData
): Promise<ContactActionResponse> {
  // Honeypot anti-spam: campo invisible para humanos (oculto vía CSS en el
  // formulario), pero que los bots rellenan automáticamente al completar
  // todos los inputs de un form. Si viene con contenido, fingimos éxito sin
  // guardar nada ni gastar cuota de Resend, para no delatarle al bot que fue
  // detectado (así no ajusta su estrategia).
  const honeypot = (formData.get('company_website') as string) || '';
  if (honeypot.trim().length > 0) {
    return { success: true };
  }

  const rawName = (formData.get('name') as string) || '';
  const rawEmail = (formData.get('email') as string) || '';
  const rawMessage = (formData.get('message') as string) || '';

  const parsed = ContactSchema.safeParse({
    name: rawName,
    email: rawEmail,
    message: rawMessage,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Datos del formulario inválidos.' };
  }

  const { name, email, message } = parsed.data;

  // 1. Guardar el mensaje en Supabase primero: así, aunque el correo falle
  // (API key mal puesta, límite de Resend, lo que sea), el mensaje no se
  // pierde y queda visible para revisión manual en el admin.
  const supabase = await createClient();
  const { data: insertedRow, error: dbError } = await supabase
    .from('contact_messages')
    .insert({ name, email, message })
    .select('id')
    .single();

  if (dbError) {
    return { error: `Error al guardar tu mensaje: ${dbError.message}` };
  }

  // 2. Intentar notificar por correo vía Resend. Si no hay API key configurada
  // (todavía no se conectó Resend) o la llamada falla, el mensaje YA quedó
  // guardado en el paso anterior — no se pierde, solo no llega la notificación
  // instantánea por correo.
  const resendApiKey = process.env.RESEND_API_KEY;
  let emailSent = false;

  if (resendApiKey) {
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Wiener Hound Studios <onboarding@resend.dev>',
          to: [NOTIFICATION_EMAIL],
          reply_to: email,
          subject: `Nuevo mensaje de contacto de ${name}`,
          text: `De: ${name} <${email}>\n\n${message}`,
        }),
      });

      emailSent = emailResponse.ok;
    } catch {
      // Fallo de red hacia Resend: el mensaje ya está a salvo en Supabase,
      // seguimos sin lanzar error al usuario (su envío SÍ se registró).
      emailSent = false;
    }
  }

  if (insertedRow && emailSent) {
    await supabase.from('contact_messages').update({ email_sent: true }).eq('id', insertedRow.id);
  }

  return { success: true };
}
