import { BlogImageTranslation } from "./blog-image-translation.model";

export class BlogImage {
    id?: number;
    section?: number;
    image?: string;
    src?: string;
    is_primary?: string;
    width?: string;
    height?: string;
    mime_type?: string;
    bytes?: string;
    focal_x?: string;
    focal_y?: string;
    dominant_color?: string;
    blurhash?: string;
    translations?: BlogImageTranslation[];
    seo?: {
        alt?: string;
        title?: string;
        aria_label?: string;
        caption?: string;
        long_description?: string;
        file_name_override?: string;
    }
}
