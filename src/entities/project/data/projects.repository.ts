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
