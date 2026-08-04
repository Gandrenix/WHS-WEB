export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | string;
  created_at?: string;
}
