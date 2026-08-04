// Nota de arquitectura: esta entidad no importa `entities/project` (las reglas de
// boundaries prohíben imports entre entidades). Los repositorios devuelven solo el
// `project_id`; el cruce con los datos completos del proyecto se hace en la capa
// `app`/`features`, que sí puede importar ambas entidades.

export type ReadingStatus = 'reading' | 'completed';

export interface LibraryFavorite {
  id: string;
  project_id: string;
  created_at: string;
}

export interface LibraryProgress {
  id: string;
  project_id: string;
  chapter_number: number;
  total_chapters: number;
  status: ReadingStatus;
  updated_at: string;
}

export interface LibraryChapterBookmark {
  id: string;
  project_id: string;
  chapter_number: number;
  chapter_title: string | null;
  created_at: string;
}
