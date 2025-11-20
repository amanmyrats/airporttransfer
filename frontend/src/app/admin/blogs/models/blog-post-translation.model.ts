import { LanguageCode } from '../../../constants/language.contants';

export class BlogPostTranslation {
    id?: number;
    language?: LanguageCode;
    title?: string;
    short_description?: string;
    slug?: string;
    seo_title?: string;
    seo_description?: string;
    created_at?: string;
    updated_at?: string;
}

