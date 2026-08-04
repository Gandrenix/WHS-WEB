'use server';

// Server Actions para administrar las fichas de "espécimen" de la sección
// STRATA I de la landing (antes hardcodeadas en StrataOneSection.tsx, ver
// supabase_specimen_cards.sql). Mismo patrón que project.actions.ts: checkeo
// liviano de sesión acá, la protección real de "solo admin puede escribir"
// vive en la RLS (is_admin()) de la tabla.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SpecimenCardSchema } from '../schemas/specimenCard.schema';
import type { ActionResponse } from './project.actions';

function parseSpecimenCardForm(formData: FormData) {
  return SpecimenCardSchema.safeParse({
    position: formData.get('position'),
    cat: formData.get('cat'),
    title: formData.get('title'),
    description: formData.get('description'),
    input_label: formData.get('input_label'),
    output_label: formData.get('output_label'),
    lang_label: formData.get('lang_label'),
    status: formData.get('status') || 'ACTIVO',
    icon: formData.get('icon') || undefined,
  });
}

export async function createSpecimenCardAction(
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

  const parsed = parseSpecimenCardForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const { error: dbError } = await supabase.from('specimen_cards').insert({
    ...parsed.data,
    icon: parsed.data.icon || null,
  });

  if (dbError) {
    return { error: `Error al crear la ficha: ${dbError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard/especimenes');

  return { success: true };
}

export async function updateSpecimenCardAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetCardId = formData.get('target_card_id') as string;

  if (!targetCardId) {
    return { error: 'ID de ficha no especificado.' };
  }

  const parsed = parseSpecimenCardForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const { error: dbError } = await supabase
    .from('specimen_cards')
    .update({
      ...parsed.data,
      icon: parsed.data.icon || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetCardId);

  if (dbError) {
    return { error: `Error al actualizar la ficha: ${dbError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard/especimenes');

  return { success: true };
}

export async function deleteSpecimenCardAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetCardId = formData.get('target_card_id') as string;

  if (!targetCardId) {
    return { error: 'ID de ficha no especificado para eliminar.' };
  }

  // No se borra el archivo del bucket `whs-media` si la ficha tenía imagen
  // (mismo criterio que deleteProjectAction: podría estar reutilizado, y un
  // fallo de storage a mitad de un delete es peor que un archivo huérfano).
  const { error: dbError } = await supabase.from('specimen_cards').delete().eq('id', targetCardId);

  if (dbError) {
    return { error: `Error al eliminar la ficha: ${dbError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard/especimenes');

  return { success: true };
}

export async function updateSpecimenCardImageAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetCardId = formData.get('target_card_id') as string;
  const file = formData.get('file') as File | null;

  if (!targetCardId || !file || file.size === 0) {
    return { error: 'Seleccione un archivo de imagen válido.' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `specimen-cards/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('whs-media').upload(filePath, file);

    if (uploadError) {
      return { error: `Error al subir imagen: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabase.storage.from('whs-media').getPublicUrl(filePath);
    const imageUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('specimen_cards')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', targetCardId);

    if (updateError) {
      return { error: `Error al actualizar la imagen: ${updateError.message}` };
    }

    revalidatePath('/');
    revalidatePath('/admin/dashboard/especimenes');

    return { success: true };
  } catch {
    return { error: 'Ocurrió un fallo al subir la imagen.' };
  }
}

export interface RemoveSpecimenCardImageResult {
  error?: string;
}

// A diferencia de las demás, esta no está atada a un <form>: se llama
// directo desde un botón "quitar imagen" (mismo patrón que
// toggleFavoriteAction). Por eso el componente que la usa necesita
// router.refresh() después de llamarla — revalidatePath no repinta un
// árbol de cliente ya montado si no viene de un <form action>.
export async function removeSpecimenCardImageAction(cardId: string): Promise<RemoveSpecimenCardImageResult> {
  try {
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('specimen_cards')
      .update({ image_url: null, updated_at: new Date().toISOString() })
      .eq('id', cardId);

    if (dbError) return { error: dbError.message };

    revalidatePath('/');
    revalidatePath('/admin/dashboard/especimenes');

    return {};
  } catch {
    return { error: 'No se pudo quitar la imagen.' };
  }
}
