import 'server-only';
import { createClient } from '@/shared/lib/supabase/server';
import { env } from '@/shared/config/env';
import type { Project } from '../types';

const TIMEOUT_MS = 1000;

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

const PROJECT_SELECT_FIELDS =
  'id, created_at, title, description, category, status, image_url, file_type, document_url, markdown_content';

export async function getRecentProjects(limit = 6): Promise<Project[]> {
  if (!isConfigured) return [];
  try {
    const supabase = await createClient();
    const result = await withTimeout(
      supabase
        .from('projects')
        .select(PROJECT_SELECT_FIELDS)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
    if (result.error) return [];
    return (result.data as Project[]) ?? [];
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
        .select(PROJECT_SELECT_FIELDS)
        .order('created_at', { ascending: false })
    );
    if (result.error) return [];
    return (result.data as Project[]) ?? [];
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
        .select(PROJECT_SELECT_FIELDS)
        .eq('category', category)
        .order('created_at', { ascending: false })
    );
    if (result.error) return [];
    return (result.data as Project[]) ?? [];
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
        .select(PROJECT_SELECT_FIELDS)
        .eq('id', id)
        .single()
    );
    if (result.error || !result.data) return null;
    return result.data as Project;
  } catch {
    return null;
  }
}

