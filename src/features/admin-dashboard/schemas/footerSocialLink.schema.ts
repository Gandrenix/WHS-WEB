import { z } from 'zod';

export const FooterSocialLinkSchema = z.object({
  position: z.coerce.number().int('La posición debe ser un número entero.').min(0).default(0),
  label: z.string().trim().min(1, 'Escribe el texto del enlace (ej. GitHub).').max(40, 'Máximo 40 caracteres.'),
  url: z.string().trim().min(1, 'Escribe la URL del enlace.').url('Debe ser una URL válida (ej. https://github.com).'),
});

export type FooterSocialLinkInput = z.infer<typeof FooterSocialLinkSchema>;
