import { z } from 'zod';

export const ProjectSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.string().min(2, 'Categoría de proyecto no válida'),
  status: z.enum(['En Emisión', 'Pausado', 'Finalizado'], {
    message: 'El estado debe ser: En Emisión, Pausado o Finalizado',
  }),
  file_type: z.enum(['pdf', 'markdown']).nullable().optional(),
  document_url: z.string().nullable().optional(),
  markdown_content: z.string().nullable().optional(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

