import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import { getProfile } from '@/entities/profile/server';
import { getAllProjects, type Project } from '@/entities/project/server';
import {
  getFavoritesForUser,
  getReadingProgressForUser,
  getChapterBookmarksForUser,
} from '@/entities/library/server';
import { UserDashboard } from '@/features/reader-dashboard';
import { SignOutButton } from '@/features/auth';
import type {
  ProgressWithProject,
  FavoriteWithProject,
  ActivityEntry,
  BookmarkedChapterWithProject,
} from '@/features/reader-dashboard';

export default async function BibliotecaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [profile, allProjects, favoriteRows, progressRows, chapterBookmarkRows] = await Promise.all([
    getProfile(user.id),
    getAllProjects(),
    getFavoritesForUser(user.id),
    getReadingProgressForUser(user.id),
    getChapterBookmarksForUser(user.id),
  ]);

  const projectsById = new Map<string, Project>(allProjects.map((p) => [p.id, p]));

  const favorites: FavoriteWithProject[] = favoriteRows
    .map((row) => {
      const project = projectsById.get(row.project_id);
      return project ? { id: row.id, project, createdAt: row.created_at } : null;
    })
    .filter((item): item is FavoriteWithProject => item !== null);

  const allProgress: ProgressWithProject[] = progressRows
    .map((row) => {
      const project = projectsById.get(row.project_id);
      return project
        ? {
            id: row.id,
            project,
            chapterNumber: row.chapter_number,
            totalChapters: row.total_chapters,
            status: row.status,
            updatedAt: row.updated_at,
          }
        : null;
    })
    .filter((item): item is ProgressWithProject => item !== null);

  const continueReading = allProgress.filter((item) => item.status === 'reading');
  const completed = allProgress.filter((item) => item.status === 'completed');

  const bookmarkedChapters: BookmarkedChapterWithProject[] = chapterBookmarkRows
    .map((row) => {
      const project = projectsById.get(row.project_id);
      return project
        ? {
            id: row.id,
            project,
            chapterNumber: row.chapter_number,
            chapterTitle: row.chapter_title,
            createdAt: row.created_at,
          }
        : null;
    })
    .filter((item): item is BookmarkedChapterWithProject => item !== null);

  const activity: ActivityEntry[] = [
    ...allProgress.map((item) => ({
      id: `progress-${item.id}`,
      type: item.status === 'completed' ? ('completed' as const) : ('progress' as const),
      project: item.project,
      timestamp: item.updatedAt,
    })),
    ...favorites.map((item) => ({
      id: `favorite-${item.id}`,
      type: 'favorite' as const,
      project: item.project,
      timestamp: item.createdAt,
    })),
    ...bookmarkedChapters.map((item) => ({
      id: `bookmark-${item.id}`,
      type: 'bookmark' as const,
      project: item.project,
      timestamp: item.createdAt,
      chapterNumber: item.chapterNumber,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <UserDashboard
      profile={
        profile ?? { id: user.id, display_name: user.email ?? 'Viajero', avatar_url: null, role: 'user' }
      }
      continueReading={continueReading}
      favorites={favorites}
      bookmarkedChapters={bookmarkedChapters}
      activity={activity}
      stats={{
        reading: continueReading.length,
        completed: completed.length,
        favorites: favorites.length,
        bookmarks: bookmarkedChapters.length,
      }}
      signOutSlot={
        <SignOutButton className="text-[11px] text-[#F2EDE4]/50 hover:text-[#7A1220] font-bold uppercase tracking-wider transition-colors cursor-pointer" />
      }
    />
  );
}
