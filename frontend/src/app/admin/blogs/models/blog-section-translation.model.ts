import { BlogSection } from "./blog-section.model";
import { LanguageCode } from '../../../constants/language.contants';

export class BlogSectionTranslation {
    id?: number;
    section?: number;
    section_obj?: BlogSection;
    language?: LanguageCode;
    heading?: string;
    body?: string;
    og_image?: string | null;
    og_image_url?: string | null;
    created_at?: string;
    updated_at?: string;
}
