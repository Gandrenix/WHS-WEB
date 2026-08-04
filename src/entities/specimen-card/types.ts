// Fichas de "espécimen" de la sección STRATA I de la landing (grilla de 4
// tarjetas tipo "HealthTech & Bioinformática" en la home). Antes vivían
// hardcodeadas en StrataOneSection.tsx; ahora se administran desde
// /admin/dashboard/especimenes y se leen públicamente para la home.
export interface SpecimenCard {
  id: string;
  /** Orden de aparición en la grilla (menor = primero). */
  position: number;
  cat: string;
  title: string;
  description: string;
  input_label: string;
  output_label: string;
  lang_label: string;
  status: string;
  /** Emoji de respaldo — se usa SOLO si no hay image_url subida. */
  icon: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}
