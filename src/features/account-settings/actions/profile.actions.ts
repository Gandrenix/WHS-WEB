'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';

const ProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Tu nombre debe tener al menos 2 caracteres')
    .max(60, 'Tu nombre es demasiado largo'),
});

const MAX_AVATAR_SIZE_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export interface ProfileActionState {
  error?: string | null;
  success?: boolean;
}

export async function updateProfileAction(
  prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const displayName = formData.get('displayName') as string;

  const parsed = ProfileSchema.safeParse({ displayName });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Debes iniciar sesión para editar tu perfil.' };
    }

    const updatePayload: { display_name: string; avatar_url?: string } = {
      display_name: parsed.data.displayName,
    };

    const avatarFile = formData.get('avatar') as File | null;
    if (avatarFile && avatarFile.size > 0) {
      if (avatarFile.size > MAX_AVATAR_SIZE_BYTES) {
        return { error: 'La imagen es demasiado grande (máximo 4MB).' };
      }
      if (!ALLOWED_AVATAR_TYPES.includes(avatarFile.type)) {
        return { error: 'Formato de imagen no soportado. Usa PNG, JPG, WEBP o GIF.' };
      }

      const ext = avatarFile.name.split('.').pop() || 'png';
      const filePath = `avatars/${user.id}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('whs-media')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        return { error: 'No se pudo subir tu foto de perfil. Intenta de nuevo.' };
      }

      const { data: publicUrlData } = supabase.storage.from('whs-media').getPublicUrl(filePath);
      updatePayload.avatar_url = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('profiles').update(updatePayload).eq('id', user.id);
    if (error) {
      return { error: 'No se pudo actualizar tu perfil.' };
    }

    revalidatePath('/biblioteca');
    revalidatePath('/biblioteca/ajustes');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch {
    return { error: 'Ocurrió un error inesperado al actualizar tu perfil.' };
  }
}
