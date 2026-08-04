export interface DownloadLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  created_at?: string;
  title: string;
  description: string;
  category: 'apps' | 'animaciones' | 'visual-novel' | 'games' | string;
  status: string;
  image_url: string | null;
  file_type?: 'pdf' | 'markdown' | null;
  document_url?: string | null;
  markdown_content?: string | null;
  video_url?: string | null;
  audio_url?: string | null;
  gallery_urls?: string[] | null;
  /** Enlaces externos de descarga (ej. Google Drive) mostrados al lector final. */
  download_links?: DownloadLink[] | null;
}
