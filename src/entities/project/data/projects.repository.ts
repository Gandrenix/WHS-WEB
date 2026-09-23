import 'server-only';
import { createClient } from '@/shared/lib/supabase/server';
import { env } from '@/shared/config/env';
import type { Project } from '../types';
import { parseYamlFrontmatter } from '@/features/document-reader/components/MarkdownEngine/MarkdownParser';

const TIMEOUT_MS = 2000;

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase network timeout')), timeoutMs)
    ),
  ]);
}

const isConfigured = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL &&
  !env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase')
);

// Helper to normalize and populate fallback multi-media metadata from markdown frontmatter if DB columns are null
function normalizeProjectMedia(project: Project): Project {
  if (!project) return project;

  let videoUrl = project.video_url || null;
  let audioUrl = project.audio_url || null;
  let galleryUrls = project.gallery_urls || null;

  if (project.markdown_content) {
    try {
      const { frontmatter } = parseYamlFrontmatter(project.markdown_content);
      if (!videoUrl && frontmatter.video_url) videoUrl = String(frontmatter.video_url);
      if (!audioUrl && frontmatter.audio_url) audioUrl = String(frontmatter.audio_url);
      if (!galleryUrls && Array.isArray(frontmatter.gallery_urls)) {
        galleryUrls = frontmatter.gallery_urls.map(String);
      }
    } catch {
      // Ignore frontmatter parse errors
    }
  }

  return {
    ...project,
    video_url: videoUrl,
    audio_url: audioUrl,
    gallery_urls: galleryUrls,
  };
}

/** "Ortodoncia Sonrisa Real" -> "ortodoncia-sonrisa-real". Nunca vacío (fallback "obra"). */
function slugify(text: string): string {
  const base = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tildes/diacríticos sueltos, ya separados por normalize
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'obra';
}

/**
 * Genera el slug de una obra nueva a partir de su título, probando sufijos (-2, -3, ...)
 * hasta encontrar uno libre — dos obras con el mismo título ("Ortodoncia" x2) no pueden
 * chocar contra la restricción UNIQUE de la columna. Solo se llama al CREAR: una vez
 * asignado, el slug no cambia aunque el título se edite después, para no romper links ya
 * compartidos ni el sitemap indexado.
 */
export async function generateUniqueProjectSlug(title: string): Promise<string> {
  const base = slugify(title);
  if (!isConfigured) return base;
  try {
    const supabase = await createClient();
    let candidate = base;
    let suffix = 2;
    for (let attempt = 0; attempt < 50; attempt++) {
      const { data } = await withTimeout(
        supabase.from('projects').select('id').eq('slug', candidate).limit(1)
      );
      if (!data || data.length === 0) return candidate;
      candidate = `${base}-${suffix++}`;
    }
    return `${base}-${Date.now()}`;
  } catch {
    return `${base}-${Date.now()}`;
  }
}

export async function getRecentProjects(limit = 6): Promise<Project[]> {
  if (!isConfigured) return [];
  try {
    const supabase = await createClient();
    const result = await withTimeout(
      supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
    );
    if (result.error) return [];
    return ((result.data as Project[]) ?? []).map(normalizeProjectMedia);
  } catch {
    return [];
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (!isConfigured) return [];
  try {
    const supabase = await createClient();
    const result = await withTimeout(
      supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
    );
    if (result.error) return [];
    return ((result.data as Project[]) ?? []).map(normalizeProjectMedia);
  } catch {
    return [];
  }
}

export async function getProjectsByCategory(category: string): Promise<Project[]> {
  if (!isConfigured) return [];
  try {
    const supabase = await createClient();
    const result = await withTimeout(
      supabase
        .from('projects')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
    );
    if (result.error) return [];
    return ((result.data as Project[]) ?? []).map(normalizeProjectMedia);
  } catch {
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!isConfigured) return null;
  try {
    const supabase = await createClient();
    const result = await withTimeout(
      supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
    );
    if (result.error || !result.data) return null;
    return normalizeProjectMedia(result.data as Project);
  } catch {
    return null;
  }
}

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isConfigured) return null;
  try {
    const supabase = await createClient();
    const result = await withTimeout(
      supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single()
    );
    if (result.error || !result.data) return null;
    return normalizeProjectMedia(result.data as Project);
  } catch {
    return null;
  }
}

/**
 * La ruta pública de una obra es /categorias/[slug] — pero cualquier link con el UUID
 * viejo (compartido antes de que existiera el slug, o guardado en una notificación que
 * solo conoce el project_id) debe seguir funcionando. Si el parámetro tiene forma de
 * UUID, se busca por id; si no, por slug.
 */
export async function getProjectBySlugOrId(slugOrId: string): Promise<Project | null> {
  return UUID_PATTERN.test(slugOrId) ? getProjectById(slugOrId) : getProjectBySlug(slugOrId);
}
