export interface Video {
  id: string;

  // Core
  title: string;
  description?: string;
  slug?: string;
  video_type?: 'normal' | 'short';

  // Playback
  stream_url?: string;
  video_url?: string;
  storage_type?: 'local' | 'cloudflare';

  // UI / metadata
  thumbnail_url?: string;
  duration?: number;
  views?: number;
  category?: string;
  country?: string;

  // 🔥 Engagement (ADD THIS)
  likes_count?: number;
  is_liked?: boolean;

  // SEO
  meta_title?: string;
  meta_description?: string;
  focus_keywords?: string[];

  // Admin / visibility
  is_active?: boolean;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// admin-video.types.ts (optional but clean)
export interface PaginatedVideos {
  results: Video[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VideoCategory {
  id: string; // optional for now, required after DB migration
  name: string;
  image_url?: string | null; // ✅ ADD THIS
  slug?: string; // future SEO / routing
  is_active?: boolean;
  created_at?: string;
}
