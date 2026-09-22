import 'server-only';
import { createClient } from '@/shared/lib/supabase/server';
import type { Song } from '../types';

// Lectura pública (RLS "Public can view songs" USING (true)): el reproductor
// del header las necesita para cualquier visitante, con o sin sesión.
export async function getSongs(): Promise<Song[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from('songs').select('*').order('position', { ascending: true });

    if (error || !data) return [];

    return data as unknown as Song[];
  } catch {
    return [];
  }
}
