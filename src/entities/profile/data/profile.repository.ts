import 'server-only';
import { createClient } from '@/shared/lib/supabase/server';
import type { Profile } from '../types';

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

// Perfil + usuario de la sesión activa (o null si nadie ha iniciado sesión)
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      // Perfil aún no creado por el trigger (carrera rara justo tras el registro)
      return { id: user.id, display_name: user.email ?? null, avatar_url: null, role: 'user' };
    }

    return data as Profile;
  } catch {
    return null;
  }
}
