import { BlogImage } from "./blog-image.model";
import { BlogSectionTranslation } from "./blog-section-translation.model";

export class BlogSectionLocalized {
    id?: number;
    order?: number;
    section_type?: 'text' | 'image' | 'gallery' | 'faq' | 'booking_form' | 'cta_banner' | 'map' | 'video' | 'features' | 'steps' | 'table' | 'download' | 'quote';
    translations?: BlogSectionTranslation[]; // Only 1 translation per language in localized view
    images?: BlogImage[];
    is_fallback?: boolean;
    fallback_language?: string | null;

}
