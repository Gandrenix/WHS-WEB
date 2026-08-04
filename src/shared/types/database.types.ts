export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          category: string;
          status: string;
          image_url: string | null;
          file_type: string | null;
          document_url: string | null;
          markdown_content: string | null;
          video_url: string | null;
          audio_url: string | null;
          gallery_urls: string[] | null;
          download_links: { label: string; url: string }[] | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          category: string;
          status?: string;
          image_url?: string | null;
          file_type?: string | null;
          document_url?: string | null;
          markdown_content?: string | null;
          video_url?: string | null;
          audio_url?: string | null;
          gallery_urls?: string[] | null;
          download_links?: { label: string; url: string }[] | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          category?: string;
          status?: string;
          image_url?: string | null;
          file_type?: string | null;
          document_url?: string | null;
          markdown_content?: string | null;
          video_url?: string | null;
          audio_url?: string | null;
          gallery_urls?: string[] | null;
          download_links?: { label: string; url: string }[] | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          chapter_number: number;
          total_chapters: number;
          status: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          chapter_number?: number;
          total_chapters?: number;
          status?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          chapter_number?: number;
          total_chapters?: number;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          message: string;
          email_sent: boolean;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          message: string;
          email_sent?: boolean;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          message?: string;
          email_sent?: boolean;
          is_read?: boolean;
        };
        Relationships: [];
      };
      chapter_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          chapter_number: number;
          chapter_title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          chapter_number: number;
          chapter_title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          chapter_number?: number;
          chapter_title?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          parent_id: string | null;
          chapter_number: number | null;
          chapter_title: string | null;
          body: string;
          is_deleted: boolean;
          deleted_by_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          parent_id?: string | null;
          chapter_number?: number | null;
          chapter_title?: string | null;
          body: string;
          is_deleted?: boolean;
          deleted_by_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          parent_id?: string | null;
          chapter_number?: number | null;
          chapter_title?: string | null;
          body?: string;
          is_deleted?: boolean;
          deleted_by_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comment_reactions: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          comment_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string | null;
          type: string;
          comment_id: string | null;
          project_id: string | null;
          chapter_number: number | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id?: string | null;
          type?: string;
          comment_id?: string | null;
          project_id?: string | null;
          chapter_number?: number | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string | null;
          type?: string;
          comment_id?: string | null;
          project_id?: string | null;
          chapter_number?: number | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      specimen_cards: {
        Row: {
          id: string;
          position: number;
          cat: string;
          title: string;
          description: string;
          input_label: string;
          output_label: string;
          lang_label: string;
          status: string;
          icon: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          position?: number;
          cat: string;
          title: string;
          description: string;
          input_label: string;
          output_label: string;
          lang_label: string;
          status?: string;
          icon?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          position?: number;
          cat?: string;
          title?: string;
          description?: string;
          input_label?: string;
          output_label?: string;
          lang_label?: string;
          status?: string;
          icon?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      footer_social_links: {
        Row: {
          id: string;
          position: number;
          label: string;
          url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          position?: number;
          label: string;
          url: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          position?: number;
          label?: string;
          url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      upsert_reading_progress: {
        Args: {
          p_project_id: string;
          p_chapter_number: number;
          p_total_chapters: number;
          p_status: string;
        };
        Returns: void;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

