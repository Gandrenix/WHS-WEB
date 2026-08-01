'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import { ProjectSchema } from '../schemas/project.schema';

export interface ActionResponse {
  error?: string | null;
  success?: boolean;
}

export async function createProjectAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  // 1. Defensa en profundidad: Verificar sesión y usuario autenticado en el servidor
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado. Inicie sesión para crear proyectos.' };
  }

  const rawTitle = formData.get('title') as string;
  const rawDescription = formData.get('description') as string;
  const rawCategory = formData.get('category') as string;
  const rawStatus = formData.get('status') as string;
  const rawFileType = (formData.get('file_type') as string) || null;
  let rawMarkdownContent = (formData.get('markdown_content') as string) || null;

  const fileTypeToUse = rawFileType === 'pdf' || rawFileType === 'markdown' ? rawFileType : null;

  // 2. Validación estricta con Zod
  const parsed = ProjectSchema.safeParse({
    title: rawTitle,
    description: rawDescription,
    category: rawCategory,
    status: rawStatus,
    file_type: fileTypeToUse,
    markdown_content: rawMarkdownContent,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Datos del proyecto inválidos',
    };
  }

  let imageUrl: string | null = null;
  const file = formData.get('file') as File | null;

  // 3. Subida de portada si está presente
  if (file && file.size > 0) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `project-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('whs-media')
        .upload(filePath, file);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('whs-media')
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }
    } catch (e) {
      console.warn('Image upload failed, saving project without cover:', e);
    }
  }

  // 4. Subida de documento PDF o Markdown si está presente
  let documentUrl: string | null = null;
  const docFile = formData.get('doc_file') as File | null;

  if (fileTypeToUse && docFile && docFile.size > 0) {
    try {
      if (fileTypeToUse === 'markdown') {
        // Leer texto directo del archivo .md si no se introdujo manualmente
        const text = await docFile.text();
        if (text && text.trim().length > 0) {
          rawMarkdownContent = text;
        }
      }

      const docExt = docFile.name.split('.').pop() || (fileTypeToUse === 'pdf' ? 'pdf' : 'md');
      const docName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${docExt}`;
      const docPath = `documents/${docName}`;

      const { error: docUploadError } = await supabase.storage
        .from('whs-media')
        .upload(docPath, docFile);

      if (!docUploadError) {
        const { data: docPublicUrl } = supabase.storage
          .from('whs-media')
          .getPublicUrl(docPath);
        documentUrl = docPublicUrl.publicUrl;
      }
    } catch (e) {
      console.warn('Document file upload failed:', e);
    }
  }

  // 5. Inserción en la base de datos
  const { error: dbError } = await supabase.from('projects').insert({
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    status: parsed.data.status,
    image_url: imageUrl,
    file_type: fileTypeToUse,
    document_url: documentUrl,
    markdown_content: rawMarkdownContent,
  });

  if (dbError) {
    return { error: `Error al guardar en base de datos: ${dbError.message}` };
  }

  // 6. Invalidador de rutas afectadas
  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  redirect('/admin/dashboard');
}

