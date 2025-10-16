import { FaqLibraryItem } from "./faq-library-item.model";

export class BlogPostFaqLink {
    id?: string;
    blog_post?: string;
    faq_item?: string;
    faq_item_obj?: FaqLibraryItem; // expanded FAQ item
    order?: string;
    blog_post_title?: string; // denormalized field for convenience
    blog_post_slug?: string;  // denormalized field for convenience
    blog_post_internal_title?: string; // denormalized field for convenience
    faq_item_internal_identifier?: string; // denormalized field for convenience

    override_question?: string;
    override_answer?: string;
}