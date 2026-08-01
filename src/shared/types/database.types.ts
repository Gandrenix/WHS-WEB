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
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

