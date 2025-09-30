// blog-section-map.model.ts
import { BlogSectionMapTranslation } from './blog-section-map-translation.model';

export class BlogSectionMap {
    id?: string | number;
  // PK == section id (OneToOne)
  section?: string; // or number, depending on your API usage

  provider?: 'google_my_maps' | string;
  is_active?: boolean;

  // optional internal id used on provider side
  internal_identifier?: string;

  // UI hint for iframe height
  iframe_height?: string | number;

  // Computed by API (from serializer get_resolved_url)
  resolved_url?: string;

  // Relations
  translations?: BlogSectionMapTranslation[];

  // Timestamps
  created_at?: string;
  updated_at?: string;
}
