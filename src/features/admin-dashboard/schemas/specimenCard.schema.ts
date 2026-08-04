import { z } from 'zod';

export const SpecimenCardSchema = z.object({
  position: z.coerce.number().int('La posición debe ser un número entero.').min(0).default(0),
  cat: z.string().trim().min(1, 'Escribe el código de categoría (ej. CAT. WC-003).'),
  title: z.string().trim().min(1, 'Escribe el título de la ficha.'),
  description: z.string().trim().min(1, 'Escribe una descripción.').max(300, 'Máximo 300 caracteres.'),
  input_label: z.string().trim().min(1, 'Escribe la etiqueta de INPUT.'),
  output_label: z.string().trim().min(1, 'Escribe la etiqueta de OUTPUT.'),
  lang_label: z.string().trim().min(1, 'Escribe el stack o lenguaje.'),
  status: z.string().trim().min(1, 'Escribe el estado.').default('ACTIVO'),
  icon: z.string().trim().max(8, 'Usa un solo emoji.').optional(),
});

export type SpecimenCardInput = z.infer<typeof SpecimenCardSchema>;
