// Enlaces sociales del footer ("ENCUÉNTRANOS": GitHub, LinkedIn, YouTube,
// SoundCloud, Itch.io). Antes vivían hardcodeados en ResurfaceSection.tsx y
// Footer.tsx; ahora se administran desde /admin/dashboard/footer y se leen
// públicamente para el footer del sitio.
export interface FooterSocialLink {
  id: string;
  /** Orden de aparición en el footer (menor = primero). */
  position: number;
  label: string;
  url: string;
  created_at: string;
  updated_at: string;
}
