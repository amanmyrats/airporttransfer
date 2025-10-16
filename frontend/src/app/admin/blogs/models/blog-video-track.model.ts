// blog-video-track.model.ts (optional but useful for subtitles/captions)
export class BlogVideoTrack {
    id?: string;
    video?: string;                 // FK to BlogVideo
    kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata' | string;
    language?: string;              // e.g., 'en', 'de', 'tr', 'ru'
    label?: string;                 // what the user sees in the player
    src?: string;                   // URL to .vtt file
    is_default?: boolean;
  
    updated_at?: string;
    created_at?: string;
  }
  