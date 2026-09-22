import { z } from 'zod';

export const SongSchema = z.object({
  title: z.string().trim().min(1, 'Escribe el título de la canción.').max(120, 'Máximo 120 caracteres.'),
  artist: z
    .string()
    .trim()
    .max(120, 'Máximo 120 caracteres.')
    .optional()
    .transform((v) => (v ? v : null)),
  position: z.coerce.number().int('La posición debe ser un número entero.').min(0).default(0),
});

export type SongInput = z.infer<typeof SongSchema>;

// Tamaño máximo de MP3 aceptado por el formulario de subida — bodySizeLimit de
// Server Actions ya está en 50mb (next.config.ts) para no chocar acá.
export const MAX_SONG_FILE_BYTES = 25 * 1024 * 1024;
