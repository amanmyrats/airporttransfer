import { BlogPostFaqLink } from "./blog-post-faq-link.model";
import { FaqLibraryItemTranslation } from "./faq-library-item-translation.model";

export class FaqLibraryItem {
    id?: string;
    internal_identifier?: string;
    key?: string;
    slug_lock?: boolean;
    order?: string;
    links: BlogPostFaqLink[] = [];
    translations?: FaqLibraryItemTranslation[];
    is_expanded_by_default?: string;
    is_featured?: string;

    created_at?: string;
    updated_at?: string;
}
