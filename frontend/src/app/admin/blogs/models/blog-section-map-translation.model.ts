// blog-section-map-translation.model.ts
export class BlogSectionMapTranslation {
    id?: string | number;
    section_map?: string | number; // FK -> BlogSectionMap (server may send as id)
    language?: string;
  
    // language-specific Google My Maps embed URL
    embed_url?: string;
  
    created_at?: string;
    updated_at?: string;
  }
  