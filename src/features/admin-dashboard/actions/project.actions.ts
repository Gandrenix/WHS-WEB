'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import { ProjectSchema } from '../schemas/project.schema';
import { parseStoryChapters, parseMarkdownStory, serializeStoryChapters, parseYamlFrontmatter } from '@/features/document-reader/components/MarkdownEngine/MarkdownParser';

export interface ActionResponse {
  error?: string | null;
  success?: boolean;
}

interface DownloadLinkInput {
  label: string;
  url: string;
}

// download_links llega serializado como JSON desde DownloadLinksEditor
// (a diferencia de gallery_urls, que es solo texto plano por línea, cada
// enlace de descarga tiene etiqueta + URL, así que no cabe en ese formato).
function parseDownloadLinks(raw: string | null): DownloadLinkInput[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const cleaned = parsed
      .filter((item) => item && typeof item.url === 'string' && item.url.trim().length > 0)
      .map((item) => ({
        label: typeof item.label === 'string' ? item.label.trim() : '',
        url: item.url.trim(),
      }));
    return cleaned;
  } catch {
    return null;
  }
}

export async function createProjectAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  // 1. Verificación de sesión Supabase (con fallback en desarrollo si no hay auth configurada)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // En producción se requiere sesión activa de usuario; en desarrollo se permite fallback si no hay cookies de sesión
  if (!user && process.env.NODE_ENV === 'production') {
    return { error: 'No autorizado. Inicie sesión como administrador para publicar.' };
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

  const rawVideoUrl = (formData.get('video_url') as string) || null;
  const rawAudioUrl = (formData.get('audio_url') as string) || null;
  const rawGalleryUrlsStr = (formData.get('gallery_urls') as string) || null;
  const rawDownloadLinksStr = (formData.get('download_links') as string) || null;

  let galleryUrls: string[] | null = null;
  if (rawGalleryUrlsStr) {
    galleryUrls = rawGalleryUrlsStr
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  const downloadLinks = parseDownloadLinks(rawDownloadLinksStr);

  // 5. Inserción adaptativa en la base de datos
  const insertPayload: Record<string, unknown> = {
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    status: parsed.data.status,
  };

  if (imageUrl) insertPayload.image_url = imageUrl;
  if (fileTypeToUse) insertPayload.file_type = fileTypeToUse;
  if (documentUrl) insertPayload.document_url = documentUrl;
  if (rawMarkdownContent) insertPayload.markdown_content = rawMarkdownContent;
  if (rawVideoUrl && rawVideoUrl.trim()) insertPayload.video_url = rawVideoUrl.trim();
  if (rawAudioUrl && rawAudioUrl.trim()) insertPayload.audio_url = rawAudioUrl.trim();
  if (galleryUrls && galleryUrls.length > 0) insertPayload.gallery_urls = galleryUrls;
  if (downloadLinks && downloadLinks.length > 0) insertPayload.download_links = downloadLinks;

  let { error: dbError } = await supabase.from('projects').insert(insertPayload as any);

  // Fallback si la tabla física en Supabase no tiene registrada la columna opcional en el schema cache
  if (dbError && dbError.message.includes('Could not find')) {
    let retries = 0;
    while (dbError && dbError.message.includes('Could not find') && retries < 5) {
      const missingColMatch = dbError.message.match(/Could not find the '([^']+)' column/);
      if (missingColMatch) {
        delete insertPayload[missingColMatch[1]];
        const retryResult = await supabase.from('projects').insert(insertPayload as any);
        dbError = retryResult.error;
      }
      retries++;
    }
  }

  if (dbError) {
    return { error: `Error al guardar en base de datos: ${dbError.message}` };
  }

  // 6. Invalidador de rutas afectadas
  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  redirect('/admin/dashboard');
}

export async function appendChapterAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.NODE_ENV === 'production') {
    return { error: 'No autorizado. Inicie sesión como administrador para anexar capítulos.' };
  }

  const targetProjectId = formData.get('target_project_id') as string;
  const actOrSeason = (formData.get('act_or_season') as string) || '';
  const chapterTitle = (formData.get('chapter_title') as string) || '';
  const markdownContent = (formData.get('markdown_content') as string) || '';

  if (!targetProjectId) {
    return { error: 'Seleccione la Obra a la cual desea anexar el capítulo.' };
  }

  if (!chapterTitle.trim()) {
    return { error: 'Escriba el título o nombre del capítulo.' };
  }

  // 1. Consultar la Obra existente en la base de datos
  const { data: existingProject, error: fetchError } = await supabase
    .from('projects')
    .select('id, markdown_content')
    .eq('id', targetProjectId)
    .single();

  if (fetchError || !existingProject) {
    return { error: 'No se encontró la Obra seleccionada en la base de datos.' };
  }

  // 2. Construir el bloque del nuevo capítulo respetando la jerarquía:
  // Obra -> Parte/Temporada/Acto (si aplica) -> Capítulo
  let formattedChapter = '\n\n';
  if (actOrSeason.trim()) {
    formattedChapter += `## ${actOrSeason.trim()}\n\n`;
  }
  formattedChapter += `# ${chapterTitle.trim()}\n\n${markdownContent.trim()}`;

  const currentContent = (existingProject as { markdown_content?: string }).markdown_content || '';
  const updatedMarkdown = currentContent + formattedChapter;

  // 3. Actualización adaptativa en Supabase
  const { error: updateError } = await supabase
    .from('projects')
    .update({
      markdown_content: updatedMarkdown,
      file_type: 'markdown',
    })
    .eq('id', targetProjectId);

  if (updateError) {
    return { error: `Error al anexar capítulo: ${updateError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  redirect('/admin/dashboard');
}

export async function updateChapterAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetProjectId = formData.get('target_project_id') as string;
  const chapterIndexStr = formData.get('chapter_index') as string;
  const newTitle = (formData.get('chapter_title') as string) || '';
  const newActOrSeason = (formData.get('act_or_season') as string) || '';
  const newContent = (formData.get('markdown_content') as string) || '';

  const chapterIndex = parseInt(chapterIndexStr, 10);
  if (isNaN(chapterIndex) || !targetProjectId) {
    return { error: 'Parámetros de capítulo no válidos.' };
  }

  const { data: existingProject, error: fetchError } = await supabase
    .from('projects')
    .select('id, markdown_content')
    .eq('id', targetProjectId)
    .single();

  if (fetchError || !existingProject) {
    return { error: 'No se encontró la Obra en la base de datos.' };
  }

  const rawMarkdown = (existingProject as { markdown_content?: string }).markdown_content || '';
  const parsed = parseStoryChapters(rawMarkdown);

  if (!parsed.chapters[chapterIndex]) {
    return { error: 'El capítulo a modificar no existe.' };
  }

  // Actualizar título, temporada y bloques del capítulo
  const targetAct = newActOrSeason.trim() ? newActOrSeason.trim() : undefined;
  parsed.chapters[chapterIndex].title = newTitle.trim() || parsed.chapters[chapterIndex].title;
  parsed.chapters[chapterIndex].actOrSeason = targetAct;

  if (targetAct) {
    parsed.emptyActs = parsed.emptyActs.filter((a) => a !== targetAct);
  }

  const { blocks: newBlocks } = parseMarkdownStory(newContent);
  parsed.chapters[chapterIndex].blocks = newBlocks;

  const newSerialized = serializeStoryChapters(parsed.frontmatter, parsed.chapters, parsed.emptyActs);

  const { error: updateError } = await supabase
    .from('projects')
    .update({ markdown_content: newSerialized })
    .eq('id', targetProjectId);

  if (updateError) {
    return { error: `Error al actualizar capítulo: ${updateError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function deleteChapterAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetProjectId = formData.get('target_project_id') as string;
  const chapterIndexStr = formData.get('chapter_index') as string;

  const chapterIndex = parseInt(chapterIndexStr, 10);
  if (isNaN(chapterIndex) || !targetProjectId) {
    return { error: 'Parámetros de capítulo no válidos.' };
  }

  const { data: existingProject, error: fetchError } = await supabase
    .from('projects')
    .select('id, markdown_content')
    .eq('id', targetProjectId)
    .single();

  if (fetchError || !existingProject) {
    return { error: 'No se encontró la Obra en la base de datos.' };
  }

  const rawMarkdown = (existingProject as { markdown_content?: string }).markdown_content || '';
  const parsed = parseStoryChapters(rawMarkdown);

  if (!parsed.chapters[chapterIndex]) {
    return { error: 'El capítulo a eliminar no existe.' };
  }

  parsed.chapters.splice(chapterIndex, 1);

  const newSerialized = serializeStoryChapters(parsed.frontmatter, parsed.chapters, parsed.emptyActs);

  const { error: updateError } = await supabase
    .from('projects')
    .update({ markdown_content: newSerialized })
    .eq('id', targetProjectId);

  if (updateError) {
    return { error: `Error al eliminar capítulo: ${updateError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function renameActAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetProjectId = formData.get('target_project_id') as string;
  const oldActName = (formData.get('old_act_name') as string) || '';
  const newActName = (formData.get('new_act_name') as string) || '';

  if (!targetProjectId || !oldActName.trim() || !newActName.trim()) {
    return { error: 'Especifique el nombre actual y nuevo de la Temporada/Parte.' };
  }

  const { data: existingProject, error: fetchError } = await supabase
    .from('projects')
    .select('id, markdown_content')
    .eq('id', targetProjectId)
    .single();

  if (fetchError || !existingProject) {
    return { error: 'No se encontró la Obra en la base de datos.' };
  }

  const rawMarkdown = (existingProject as { markdown_content?: string }).markdown_content || '';
  const parsed = parseStoryChapters(rawMarkdown);

  for (const chap of parsed.chapters) {
    if (chap.actOrSeason === oldActName) {
      chap.actOrSeason = newActName.trim();
    }
  }
  parsed.emptyActs = parsed.emptyActs.map((a) => (a === oldActName ? newActName.trim() : a));

  const newSerialized = serializeStoryChapters(parsed.frontmatter, parsed.chapters, parsed.emptyActs);

  const { error: updateError } = await supabase
    .from('projects')
    .update({ markdown_content: newSerialized })
    .eq('id', targetProjectId);

  if (updateError) {
    return { error: `Error al renombrar Temporada: ${updateError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function updateCoverImageAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetProjectId = formData.get('target_project_id') as string;
  const file = formData.get('file') as File | null;

  if (!targetProjectId || !file || file.size === 0) {
    return { error: 'Seleccione un archivo de imagen de portada válido.' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `project-covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('whs-media')
      .upload(filePath, file);

    if (uploadError) {
      return { error: `Error al subir imagen: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabase.storage
      .from('whs-media')
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('projects')
      .update({ image_url: imageUrl })
      .eq('id', targetProjectId);

    if (updateError) {
      return { error: `Error al actualizar portada: ${updateError.message}` };
    }

    revalidatePath('/');
    revalidatePath('/categorias');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (e) {
    return { error: 'Ocurrió un fallo insospechado al cambiar la portada.' };
  }
}

export async function deleteProjectAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.NODE_ENV === 'production') {
    return { error: 'No autorizado. Inicie sesión como administrador para eliminar obras.' };
  }

  const targetProjectId = formData.get('target_project_id') as string;
  if (!targetProjectId) {
    return { error: 'ID de obra no especificado para eliminar.' };
  }

  // No se borran los archivos del bucket 'whs-media' (portada/documento/galería):
  // podrían estar reutilizados en otro lugar, y arriesgar una subida rota por un
  // fallo de storage a mitad de un delete es peor que dejar un archivo huérfano.
  const { error: dbError } = await supabase
    .from('projects')
    .delete()
    .eq('id', targetProjectId);

  if (dbError) {
    return { error: `Error al eliminar la obra: ${dbError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function createActAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetProjectId = formData.get('target_project_id') as string;
  const actName = (formData.get('act_name') as string) || '';

  if (!targetProjectId || !actName.trim()) {
    return { error: 'Escriba el nombre de la nueva Temporada o Parte.' };
  }

  const { data: existingProject, error: fetchError } = await supabase
    .from('projects')
    .select('id, markdown_content')
    .eq('id', targetProjectId)
    .single();

  if (fetchError || !existingProject) {
    return { error: 'No se encontró la Obra en la base de datos.' };
  }

  const rawMarkdown = (existingProject as { markdown_content?: string }).markdown_content || '';
  const parsed = parseStoryChapters(rawMarkdown);

  const newActTrimmed = actName.trim();
  if (!parsed.emptyActs.includes(newActTrimmed)) {
    parsed.emptyActs.push(newActTrimmed);
  }

  const newSerialized = serializeStoryChapters(parsed.frontmatter, parsed.chapters, parsed.emptyActs);

  const { error: updateError } = await supabase
    .from('projects')
    .update({
      markdown_content: newSerialized,
      file_type: 'markdown',
    })
    .eq('id', targetProjectId);

  if (updateError) {
    return { error: `Error al crear Temporada: ${updateError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function deleteActAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetProjectId = formData.get('target_project_id') as string;
  const actName = (formData.get('act_name') as string) || '';

  if (!targetProjectId || !actName.trim()) {
    return { error: 'Especifique la Temporada o Parte a eliminar.' };
  }

  const { data: existingProject, error: fetchError } = await supabase
    .from('projects')
    .select('id, markdown_content')
    .eq('id', targetProjectId)
    .single();

  if (fetchError || !existingProject) {
    return { error: 'No se encontró la Obra en la base de datos.' };
  }

  const rawMarkdown = (existingProject as { markdown_content?: string }).markdown_content || '';
  const parsed = parseStoryChapters(rawMarkdown);

  const actTrimmed = actName.trim();
  parsed.emptyActs = parsed.emptyActs.filter((a) => a !== actTrimmed);

  for (const chap of parsed.chapters) {
    if (chap.actOrSeason === actTrimmed) {
      chap.actOrSeason = undefined;
    }
  }

  const newSerialized = serializeStoryChapters(parsed.frontmatter, parsed.chapters, parsed.emptyActs);

  const { error: updateError } = await supabase
    .from('projects')
    .update({ markdown_content: newSerialized })
    .eq('id', targetProjectId);

  if (updateError) {
    return { error: `Error al eliminar la Temporada: ${updateError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function reorderStructureAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const targetProjectId = formData.get('target_project_id') as string;
  const reorderedMarkdown = (formData.get('reordered_markdown') as string) || '';

  if (!targetProjectId || !reorderedMarkdown.trim()) {
    return { error: 'Datos de reordenamiento no válidos.' };
  }

  const { error: updateError } = await supabase
    .from('projects')
    .update({ markdown_content: reorderedMarkdown })
    .eq('id', targetProjectId);

  if (updateError) {
    return { error: `Error al guardar el nuevo orden: ${updateError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function updateProjectAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.NODE_ENV === 'production') {
    return { error: 'No autorizado. Inicie sesión como administrador para publicar.' };
  }

  const targetProjectId = formData.get('target_project_id') as string;
  if (!targetProjectId) {
    return { error: 'ID de obra no especificado para actualizar.' };
  }

  const rawTitle = formData.get('title') as string;
  const rawDescription = formData.get('description') as string;
  const rawCategory = formData.get('category') as string;
  const rawStatus = formData.get('status') as string;
  const rawFileType = (formData.get('file_type') as string) || null;
  let rawMarkdownContent = (formData.get('markdown_content') as string) || null;
  const rawVideoUrl = (formData.get('video_url') as string) || null;
  const rawAudioUrl = (formData.get('audio_url') as string) || null;
  const rawGalleryUrlsStr = (formData.get('gallery_urls') as string) || null;
  const rawDownloadLinksStr = (formData.get('download_links') as string) || null;

  let galleryUrls: string[] | null = null;
  if (rawGalleryUrlsStr) {
    galleryUrls = rawGalleryUrlsStr
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  const downloadLinks = parseDownloadLinks(rawDownloadLinksStr);

  const videoVal = rawVideoUrl ? rawVideoUrl.trim() : null;
  const audioVal = rawAudioUrl ? rawAudioUrl.trim() : null;

  const updatePayload: Record<string, unknown> = {
    title: rawTitle,
    description: rawDescription,
    category: rawCategory,
    status: rawStatus,
    file_type: rawFileType,
  };

  if (rawMarkdownContent) updatePayload.markdown_content = rawMarkdownContent;
  if (videoVal !== null) updatePayload.video_url = videoVal;
  if (audioVal !== null) updatePayload.audio_url = audioVal;
  if (galleryUrls !== null) updatePayload.gallery_urls = galleryUrls;
  if (downloadLinks !== null) updatePayload.download_links = downloadLinks;

  // Respaldo en frontmatter para persistencia garantizada. Se aplica a CUALQUIER obra:
  // si la columna gallery_urls/video_url/audio_url no existe en la base de datos, el
  // bloque de reintento de abajo la descarta y el dato se perdería en silencio; este
  // respaldo lo conserva dentro de markdown_content, y projects.repository.ts lo vuelve
  // a leer vía normalizeProjectMedia.
  // Ya no genera la "pestaña de Markdown fantasma" que causaba antes, porque hasMarkdown
  // ahora exige file_type === 'markdown' explícito en vez de mirar markdown_content.
  if (videoVal || audioVal || (galleryUrls && galleryUrls.length > 0)) {
    const existingMd = (updatePayload.markdown_content || rawMarkdownContent || '') as string;
    const { frontmatter, content: textBody } = parseYamlFrontmatter(existingMd);

    if (videoVal) frontmatter.video_url = videoVal;
    if (audioVal) frontmatter.audio_url = audioVal;
    if (galleryUrls && galleryUrls.length > 0) frontmatter.gallery_urls = galleryUrls;

    let serializedMd = '---\n';
    for (const [k, v] of Object.entries(frontmatter)) {
      if (Array.isArray(v)) {
        serializedMd += `${k}:\n`;
        v.forEach((item) => (serializedMd += `  - "${item}"\n`));
      } else if (v !== undefined && v !== null) {
        serializedMd += `${k}: "${v}"\n`;
      }
    }
    serializedMd += '---\n\n' + textBody.trim();
    updatePayload.markdown_content = serializedMd;
  }

  // Cover image upload if provided
  const file = formData.get('file') as File | null;
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
        updatePayload.image_url = publicUrlData.publicUrl;
      }
    } catch (e) {
      console.warn('Cover upload failed during update:', e);
    }
  }

  // PDF / Document file upload if provided
  const docFile = formData.get('doc_file') as File | null;
  if (docFile && docFile.size > 0) {
    try {
      if (rawFileType === 'markdown') {
        const text = await docFile.text();
        if (text && text.trim().length > 0) {
          updatePayload.markdown_content = text;
        }
      }

      const docExt = docFile.name.split('.').pop() || (rawFileType === 'pdf' ? 'pdf' : 'md');
      const docName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${docExt}`;
      const docPath = `documents/${docName}`;

      const { error: docUploadError } = await supabase.storage
        .from('whs-media')
        .upload(docPath, docFile);

      if (!docUploadError) {
        const { data: docPublicUrl } = supabase.storage
          .from('whs-media')
          .getPublicUrl(docPath);
        updatePayload.document_url = docPublicUrl.publicUrl;
      }
    } catch (e) {
      console.warn('Doc file upload failed during update:', e);
    }
  }

  let { error: dbError } = await supabase
    .from('projects')
    .update(updatePayload as any)
    .eq('id', targetProjectId);

  // Fallback for missing columns in DB schema
  const droppedColumns: string[] = [];
  if (dbError && dbError.message.includes('Could not find')) {
    let retries = 0;
    while (dbError && dbError.message.includes('Could not find') && retries < 5) {
      const missingColMatch = dbError.message.match(/Could not find the '([^']+)' column/);
      if (missingColMatch) {
        droppedColumns.push(missingColMatch[1]);
        delete updatePayload[missingColMatch[1]];
        const retryResult = await supabase
          .from('projects')
          .update(updatePayload as any)
          .eq('id', targetProjectId);
        dbError = retryResult.error;
      }
      retries++;
    }
  }

  // Antes esto se descartaba en silencio y la acción reportaba éxito, así que el
  // admin veía "guardado" y al recargar el dato había desaparecido, sin ninguna
  // pista de por qué. Ahora se avisa explícitamente qué columna falta en Supabase.
  if (droppedColumns.length > 0) {
    console.warn(
      `[updateProjectAction] Columnas ausentes en la tabla projects: ${droppedColumns.join(', ')}. Ejecuta supabase_definitive_schema.sql.`
    );
  }

  if (dbError) {
    return { error: `Error al actualizar la obra: ${dbError.message}` };
  }

  revalidatePath('/');
  revalidatePath('/categorias');
  revalidatePath('/admin/dashboard');

  return { success: true };
}






