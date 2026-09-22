// Canciones de la playlist del reproductor del header. Antes vivía una sola,
// hardcodeada en useLogoAudio.ts (`/audio/musica-fondo.mp3`); ahora se
// administran desde /admin/dashboard/musica y se leen públicamente para el
// reproductor de cualquier página.
export interface Song {
  id: string;
  title: string;
  artist: string | null;
  /** URL pública en el bucket whs-media (carpeta songs/). */
  audio_url: string;
  /** Orden de aparición en la playlist (menor = primero). */
  position: number;
  /** La canción que suena por defecto al primer clic en el logo. Como mucho una en true. */
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
