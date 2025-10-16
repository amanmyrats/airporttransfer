import { FaqItemTranslation } from "./faq-item-translation.model";

export class FaqItem {
    id?: string;
    section?: string;
    order?: string;
    internal_note?: string;
    is_expanded_by_default?: string;
    anchor?: string;
    is_featured?: string;
    translations?: FaqItemTranslation[];
}