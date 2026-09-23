import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getProjectBySlugOrId, UUID_PATTERN } from '@/entities/project/server';
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
    slug: string;
  }>;
}

// Cada obra es una página pública compartible (link directo desde el catálogo o redes);
// sin esto, compartir un proyecto mostraba el título/imagen genéricos del sitio entero
// en vez de los de la obra.
//
// El parámetro de ruta acepta el slug legible ("cuatro-paredes") o, por compatibilidad, el
// UUID viejo de antes de que existiera el slug (ver getProjectBySlugOrId) — pero el <link
// canonical>/og:url siempre anuncia la URL con slug, nunca el UUID, para que buscadores y
// redes sociales indexen la versión legible.
export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlugOrId(slug);
  if (!project) return {};

  const title = project.title;
  const description = project.description || `${project.title} — Wiener Hound Studios`;
  const canonicalUrl = `/categorias/${project.slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
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
  const { slug } = await params;

  const project = await getProjectBySlugOrId(slug);

  if (!project) {
    notFound();
  }

  // Alguien llegó con el UUID viejo (link compartido antes del slug, o una notificación
  // que solo guarda el project_id): lo mandamos a la URL legible para que a partir de ahí
  // quede esa en la barra de direcciones y en lo que vuelva a compartir.
  if (UUID_PATTERN.test(slug) && slug !== project.slug) {
    redirect(`/categorias/${project.slug}`);
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
