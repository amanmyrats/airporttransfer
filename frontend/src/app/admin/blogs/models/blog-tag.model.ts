import { BlogTagTranslation } from "./blog-tag-translation.model";

export interface BlogTagResolved {
    name?: string;
    slug?: string;
    language?: string;
}

export class BlogTag {
    id?: number;
    name?: string;
    slug?: string;
    translations?: BlogTagTranslation[];
    resolved?: BlogTagResolved;
}
