import { z } from 'zod';

// Mismo límite que el CHECK de la tabla `comments` (char_length(btrim(body))
// BETWEEN 1 AND 2000) — se valida acá también para dar feedback claro antes
// de golpear la base de datos.
export const CommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Escribe algo antes de publicar.')
    .max(2000, 'El comentario es demasiado largo (máximo 2000 caracteres).'),
});

export type CommentInput = z.infer<typeof CommentSchema>;
