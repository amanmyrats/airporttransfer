import { BlogImage } from "./blog-image.model";
import { BlogSectionTranslation } from "./blog-section-translation.model";
import { BlogVideo } from "./blog-video.model";
import { FaqItem } from "./faq-item.model";

export class BlogSection  {
    id?: number;
    order?: number;
    section_type?: 'text' | 'image' | 'gallery' | 'booking_form' | 'quote' | 'video' | 'map' | 'faq' | 'steps' | 'table' | 'features' | 'download' | 'cta_banner';
    translations?: BlogSectionTranslation[];
    images?: BlogImage[];
    faqs?: FaqItem[];
    is_fallback?: boolean;
    fallback_language?: string | null;

    video?: BlogVideo;
}