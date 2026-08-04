'use server';

// Server Actions para administrar los enlaces sociales del footer
// ("ENCUÉNTRANOS": GitHub, LinkedIn, YouTube, SoundCloud, Itch.io — antes
// hardcodeados en ResurfaceSection.tsx y Footer.tsx, ver
// supabase_footer_social_links.sql). Mismo patrón que specimenCard.actions.ts:
// checkeo liviano de sesión acá, la protección real de "solo admin puede
// escribir" vive en la RLS (is_admin()) de la tabla.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { FooterSocialLinkSchema } from '../schemas/footerSocialLink.schema';
import type { ActionResponse } from './project.actions';

function parseFooterSocialLinkForm(formData: FormData) {
  return FooterSocialLinkSchema.safeParse({
    position: formData.get('position'),
    label: formData.get('label'),
    url: formData.get('url'),
  });
}

export async function createFooterSocialLinkAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.NODE_ENV === 'production') {
    return { error: 'No autorizado. Inicie sesión como administrador.' };
  }

  const parsed = parseFooterSocialLinkForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const { error: dbError } = await supabase.from('footer_social_links').insert(parsed.data);

  if (dbError) {
    return { error: `Error al crear el enlace: ${dbError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard/footer');

  return { success: true };
}

export async function updateFooterSocialLinkAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetLinkId = formData.get('target_link_id') as string;

  if (!targetLinkId) {
    return { error: 'ID de enlace no especificado.' };
  }

  const parsed = parseFooterSocialLinkForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const { error: dbError } = await supabase
    .from('footer_social_links')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetLinkId);

  if (dbError) {
    return { error: `Error al actualizar el enlace: ${dbError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard/footer');

  return { success: true };
}

export async function deleteFooterSocialLinkAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetLinkId = formData.get('target_link_id') as string;

  if (!targetLinkId) {
    return { error: 'ID de enlace no especificado para eliminar.' };
  }

  const { error: dbError } = await supabase.from('footer_social_links').delete().eq('id', targetLinkId);

  if (dbError) {
    return { error: `Error al eliminar el enlace: ${dbError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard/footer');

  return { success: true };
}
