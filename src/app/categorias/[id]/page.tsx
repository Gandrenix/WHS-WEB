import type { Metadata } from 'next';
import { getProjectById } from '@/entities/project/server';
import { DocumentReaderContainer, type ProgressUpdater } from '@/features/document-reader';
import {
  FavoriteToggleButton,
  ChapterBookmarkButton,
  updateReadingProgressAction,
} from '@/features/reader-dashboard';
import { CommentsSection } from '@/features/comments';
import { isProjectFavorited, getBookmarkedChapterNumbers } from '@/entities/library/server';
import { createClient } from '@/shared/lib/supabase/server';
import { notFound } from 'next/navigation';

export interface CategoryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Cada obra es una página pública compartible (link directo desde el catálogo o redes);
// sin esto, compartir un proyecto mostraba el título/imagen genéricos del sitio entero
// en vez de los de la obra.
export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return {};

  const title = project.title;
  const description = project.description || `${project.title} — Wiener Hound Studios`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/categorias/${id}`,
      type: 'article',
      images: project.image_url ? [{ url: project.image_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: project.image_url ? [project.image_url] : undefined,
    },
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { id } = await params;

  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  let favoriteButton = null;
  let onProgressUpdate: ProgressUpdater | undefined;
  let chapterBookmarkButton: typeof ChapterBookmarkButton | undefined;
  let bookmarkedChapters: number[] = [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const [isFavorited, bookmarkedChapterNumbers] = await Promise.all([
      isProjectFavorited(user.id, project.id),
      getBookmarkedChapterNumbers(user.id, project.id),
    ]);

    favoriteButton = (
      <FavoriteToggleButton projectId={project.id} initialFavorited={isFavorited} variant="solid" />
    );
    onProgressUpdate = updateReadingProgressAction.bind(null, project.id);
    chapterBookmarkButton = ChapterBookmarkButton;
    bookmarkedChapters = bookmarkedChapterNumbers;
  }

  return (
    <DocumentReaderContainer
      project={project}
      favoriteButton={favoriteButton}
      onProgressUpdate={onProgressUpdate}
      ChapterBookmarkButton={chapterBookmarkButton}
      bookmarkedChapters={bookmarkedChapters}
      CommentsSection={CommentsSection}
      currentUserId={user?.id ?? null}
    />
  );
}
