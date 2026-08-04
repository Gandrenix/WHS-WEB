import type { Project } from '@/entities/project';
import type { ReadingStatus } from '@/entities/library';

export interface ProgressWithProject {
  id: string;
  project: Project;
  chapterNumber: number;
  totalChapters: number;
  status: ReadingStatus;
  updatedAt: string;
}

export interface FavoriteWithProject {
  id: string;
  project: Project;
  createdAt: string;
}

export interface BookmarkedChapterWithProject {
  id: string;
  project: Project;
  chapterNumber: number;
  chapterTitle: string | null;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  type: 'progress' | 'completed' | 'favorite' | 'bookmark';
  project: Project;
  timestamp: string;
  /** Solo para type: 'bookmark' — permite enlazar directo al capítulo guardado */
  chapterNumber?: number;
}

export interface DashboardStats {
  reading: number;
  completed: number;
  favorites: number;
  bookmarks: number;
}
