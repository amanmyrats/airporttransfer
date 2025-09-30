import { BlogSection } from "./blog-section.model";

export class BlogSectionTranslation {
    id?: number;
    section?: number;
    section_obj?: BlogSection;
    language?: 'en' | 'de' | 'ru' | 'tr';
    heading?: string;
    body?: string;
    og_image?: string | null;
    og_image_url?: string | null;
    created_at?: string;
    updated_at?: string;
}
