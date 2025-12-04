import { BlogCategory } from "./blog-category.model";
import { BlogPostFaqLink } from "./blog-post-faq-link.model";
import { BlogPostTranslation } from "./blog-post-translation.model";
import { BlogSection } from "./blog-section.model";
import { BlogTag } from "./blog-tag.model";
import { FaqLibraryItemTranslation } from "./faq-library-item-translation.model";
import { ResolvedFaq } from "./resolved-faq.model";

export class BlogPost  {
    id?: number;
    internal_title?: string;
    is_published?: boolean;
    created_at?: string;
    updated_at?: string;
    published_at?: string | null;
    seo_title?: string;
    seo_description?: string;
    main_image?: string;
    thumbnail?: string;
    category?: number | string | null;
    category_obj?: BlogCategory;
    translations?: BlogPostTranslation[];
    sections?: BlogSection[];
    views_count?: number;
    tags?: BlogTag[];
    tags_obj?: BlogTag[];
    featured?: boolean;
    priority?: number;
    is_translated_fully?: boolean;

    faq_links?: BlogPostFaqLink[];
    resolved_faqs?: ResolvedFaq[];

    canonical_url?: string;
    hreflang_links?: string;
    word_count?: string;
    reading_time?: string;
    author?: string | null;
}
