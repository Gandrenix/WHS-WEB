import { z } from 'zod';

// Solo se valida el tipo y el nombre: el peso NO se limita a propósito (es un portafolio, las
// ilustraciones pueden ser enormes). El archivo nunca pasa por el servidor de la app — va directo
// del navegador a Supabase Storage con una URL firmada, así que tampoco choca con el tope de
// ~6 MB por petición de las funciones de Netlify. El único techo que queda es el de Supabase
// (Project Settings → Storage → "Upload file size limit").
export const GalleryUploadRequestSchema = z.object({
  fileName: z.string().trim().min(1, 'El archivo no tiene nombre.').max(255),
  contentType: z.string().refine((t) => t.startsWith('image/'), 'El archivo debe ser una imagen.'),
});

export type GalleryUploadRequest = z.infer<typeof GalleryUploadRequestSchema>;
