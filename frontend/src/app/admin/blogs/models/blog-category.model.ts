import { BlogCategoryTranslation } from "./blog-category-translation.model";

export interface BlogCategoryResolved {
    name?: string;
    slug?: string;
    language?: string;
}

export class BlogCategory {
    id?: number | string;
    name?: string;
    slug?: string;
    translations?: BlogCategoryTranslation[];
    resolved?: BlogCategoryResolved;
}
