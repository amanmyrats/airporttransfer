// blog-video.model.ts  ✅ align names with DRF serializer
import { BlogVideoTranslation } from './blog-video-translation.model';
import { BlogVideoTrack } from './blog-video-track.model';

export class BlogVideo {
  id?: string;
  section?: string; // FK -> BlogSection

  provider?: 'youtube' | 'vimeo' | 'self' | 'other' | string;
  provider_video_id?: string;
  source_url?: string;

  file?: string;     // URL if uploaded
  hls_url?: string;
  dash_url?: string;

  poster?: string;   // URL to poster image
  width?: string;
  height?: string;
  duration_seconds?: string;
  bytes?: string;
  mime_type?: string;

  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsinline?: boolean;
  preload?: 'auto' | 'metadata' | 'none' | string;

  start_at?: string; // seconds (string for parity)
  end_at?: string;

  // Computed by API
  embed_src?: string;
  aspect_ratio?: string; // backend sends number; string is fine for UI

  // Relations
  translations?: BlogVideoTranslation[];
  caption_tracks?: BlogVideoTrack[];

  // add to BlogVideo (optional)
  poster_url?: string;
  sources?: { hls_url?: string; dash_url?: string; file_url?: string; mime_type?: string };
  tracks?: Array<{ language: string; kind: string; label: string; src: string; mime_type?: string; default?: boolean }>;

}
