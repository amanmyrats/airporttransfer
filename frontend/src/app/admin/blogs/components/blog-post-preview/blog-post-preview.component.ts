import { Component, inject, OnInit } from '@angular/core';
import { LocalizedBlogPost } from '../../models/localized-blog-post.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlogPost } from '../../models/blog-post.model';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogVideoPublicComponent } from '../blog-video-public/blog-video-public.component';
import { TableOfContentsComponent } from '../table-of-contents/table-of-contents.component';
import { buildSectionAnchor } from '../shared/slug.utils';
import { RelatedPostsComponent } from '../related-posts/related-posts.component';
import { BlogSectionMapPublicComponent } from '../blog-section-map-public/blog-section-map-public.component';
import { BlogBookingBoxComponent } from '../../../../blogs/components/blog-booking-box/blog-booking-box.component';
import { ImageSectionPublicComponent } from '../../../../blogs/components/image-section-public/image-section-public.component';
import { FaqSectionPublicComponent } from '../../../../blogs/components/faq-section-public/faq-section-public.component';
import { DecodeHtmlPipe } from '../../../../pipes/decode-html.pipe';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog-post-preview',
  imports: [
    CommonModule, 
    BlogBookingBoxComponent, 
    SelectButton, ButtonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    RouterLink, 
    ImageSectionPublicComponent, FaqSectionPublicComponent, 
    DecodeHtmlPipe, 
    BlogVideoPublicComponent, 
    TableOfContentsComponent, RelatedPostsComponent, 
    BlogSectionMapPublicComponent, 
  ],
  templateUrl: './blog-post-preview.component.html',
  styleUrl: './blog-post-preview.component.scss'
})
export class BlogPostPreviewComponent implements OnInit {
  slug: string = '';
  currentLanguage: string = 'en';
  blog: LocalizedBlogPost | null = null;
  id!: number;
  blogService = inject(BlogService);
  trackBySectionId = (_: number, s: any) => s?.id ?? _;
  readonly buildSectionAnchor = buildSectionAnchor;

  availableLanguages = [
    { label: 'EN', value: 'en' },
    { label: 'DE', value: 'de' },
    { label: 'RU', value: 'ru' },
    { label: 'TR', value: 'tr' }
  ];

  constructor(
    private sanitizer: DomSanitizer, 
    private route: ActivatedRoute
  ) {}


  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    console.log('Blog Post ID:', this.id);
    this.getLocalizedBlog();
  }

  getLocalizedBlog(): void {
  this.blogService.getLocalizedDetail(this.id, this.currentLanguage).subscribe({
      next: (blog) => {
        this.blog = blog;
        console.log('Localized Blog:', this.blog);
        // this.blog.sections = [...(this.blog.sections || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
      },
      error: (err) => {
        console.error('Preview load error:', err);
      }
    });
  }

  onLanguageChange(event: any): void {
    this.getLocalizedBlog();
  }

  gotoEditGeneralDetails(): string {
    return `/admin/blog-posts/${this.id}`;
  }

  gotoEditSections(): string {
    return `/admin/blog-posts/${this.id}/sections`;
  }


openAddTranslation(section: any) {
  // Open your dialog or navigate to the translation editor for this section
  // e.g., this.dialogService.open(BlogSectionTranslationFormComponent, { data: { sectionId: section.id, lang: this.currentLanguage }});
}

canCopyFrom(section: any, lang: string): boolean {
  // localized payload only includes current language; ask the server if a source exists
  // quick heuristic: allow the button; in copyFromLanguage we can fetch and handle 404 gracefully
  return true;
}

copyFromLanguage(section: any, lang: string) {
  // 1) GET /api/blogsectiontranslations/?section=<id>&language=<lang>
  // 2) Prefill a create dialog for currentLanguage, or POST directly if you prefer
  // (Keep this as an admin convenience; nothing is shown to end users.)
}


}
