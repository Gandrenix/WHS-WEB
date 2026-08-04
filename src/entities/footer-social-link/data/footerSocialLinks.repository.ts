import 'server-only';
import { createClient } from '@/shared/lib/supabase/server';
import type { FooterSocialLink } from '../types';

// Lectura pública (RLS "Public can view footer social links" USING (true)):
// se muestran en el footer a cualquier visitante, con o sin sesión.
export async function getFooterSocialLinks(): Promise<FooterSocialLink[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('footer_social_links')
      .select('*')
      .order('position', { ascending: true });

    if (error || !data) return [];

    return data as unknown as FooterSocialLink[];
  } catch {
    return [];
  }
}
