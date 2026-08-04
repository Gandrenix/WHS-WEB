import { z } from 'zod';

export const ContactSchema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre (mínimo 2 caracteres)'),
  email: z.string().trim().email('Escribe un correo electrónico válido'),
  message: z.string().trim().min(10, 'Contanos un poco más sobre tu proyecto (mínimo 10 caracteres)'),
});

export type ContactInput = z.infer<typeof ContactSchema>;
