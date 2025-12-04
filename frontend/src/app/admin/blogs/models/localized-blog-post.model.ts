import { BlogCategory } from "./blog-category.model";
import { BlogPostFaqLink } from "./blog-post-faq-link.model";
import { BlogPostTranslation } from "./blog-post-translation.model";
import { BlogSectionLocalized } from "./blog-section-localized.model";
import { BlogTag } from "./blog-tag.model";
import { ResolvedFaq } from "./resolved-faq.model";

export class LocalizedBlogPost {
    id?: number;
    slug?: string;
    is_published?: boolean;
    created_at?: string;
    updated_at?: string;
    published_at?: string | null;
    seo_title?: string;
    seo_description?: string;
    main_image?: string;
    thumbnail?: string;
    category?: BlogCategory;
    translation?: BlogPostTranslation;
    sections?: BlogSectionLocalized[];
    views_count?: number;
    tags?: BlogTag[];
    featured?: boolean;
    priority?: number;
    is_translated_fully?: boolean;

    available_languages?: string;
    is_partial?: string;
    untranslated_section_ids?: string;
    
    faq_links?: BlogPostFaqLink[];
    resolved_faqs?: ResolvedFaq[];

    canonical_url?: string;
    hreflang_links?: string;
    word_count?: string;
    reading_time?: string;

    author?: string | null;
}

