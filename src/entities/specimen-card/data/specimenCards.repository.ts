import 'server-only';
import { createClient } from '@/shared/lib/supabase/server';
import type { SpecimenCard } from '../types';

// Lectura pública (RLS "Public can view specimen cards" USING (true)): se
// muestran en la home a cualquier visitante, con o sin sesión.
export async function getSpecimenCards(): Promise<SpecimenCard[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('specimen_cards')
      .select('*')
      .order('position', { ascending: true });

    if (error || !data) return [];

    return data as unknown as SpecimenCard[];
  } catch {
    return [];
  }
}
