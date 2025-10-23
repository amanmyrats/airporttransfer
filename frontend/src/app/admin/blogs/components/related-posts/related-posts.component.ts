import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { BlogPostService } from '../../services/blog-post.service';
import { NAVBAR_MENU } from '../../../../constants/navbar-menu.constants';

type LangCode = 'en' | 'de' | 'ru' | 'tr' | string;

interface RelatedPostTranslation {
  language: LangCode;
  title: string;
  slug: string;
  seo_title?: string;
}

interface RelatedPost {
  id: number;
  published_at?: string;
  main_image_small?: string | null;
  tags?: { id: number; name: string }[] | null;
  translations: RelatedPostTranslation[]; // backend returns at least one (current lang or fallback)
}

/** Small internal service (co-located). Move to /services if you prefer. */
class RelatedPostsService {
  private http = inject(HttpClient);

  fetchRelated(postId: number, lang: string, limit = 4) {
    const params = new HttpParams().set('lang', lang).set('limit', limit);
    const url = `/api/blogposts/${postId}/related/`;
    return this.http.get<RelatedPost[]>(url, { params });
  }
}

@Component({
  selector: 'app-related-posts',
  imports: [CommonModule, RouterLink],
  templateUrl: './related-posts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './related-posts.component.scss'
})
export class RelatedPostsComponent implements OnInit {
  private srv = inject(BlogPostService);
  private platformId = inject(PLATFORM_ID);
  navbarMenu = NAVBAR_MENU;

  /** Minimal inputs */
  @Input({ required: true }) postId!: number;
  @Input({ required: true }) language!: LangCode;

  /** Optional UI config */
  @Input() title = 'Related posts';
  @Input() limit = 4;
  @Input() showDates = true;

  // state
  loading = signal(true);
  error = signal<string | null>(null);
  items = signal<RelatedPost[]>([]);

  /** Localized front-end URL for the related post (uses returned slug for the same lang) */
  private buildLocalizedUrl = (lang: string, slug: string) =>
    `/${lang}/${this.navbarMenu.newBlogs.slug[this.language]}/${slug}`;

  /** Prefer current language translation; fall back to first available */
  private pickTx = (p: RelatedPost, lang: string): RelatedPostTranslation | null => {
    const exact = p.translations.find(t => t.language === lang);
    return exact ?? (p.translations[0] ?? null);
  };

  /** View model */
  vm: Signal<Array<{
    id: number;
    title: string;
    url: string;
    image?: string | null;
    published?: string;
    tags?: { id: number; name: string }[] | null;
  }>> = computed(() => {
    const lang = this.language;
    return this.items().map(p => {
      const tx = this.pickTx(p, lang);
      const title = tx?.title ?? tx?.seo_title ?? 'Untitled';
      const url = tx ? this.buildLocalizedUrl(lang, tx.slug) : '#';
      return {
        id: p.id,
        title,
        url,
        image: p.main_image_small ?? null,
        published: p.published_at,
        tags: p.tags ?? null
      };
    });
  });

  /** JSON-LD for SEO (ItemList) */
  jsonLd: Signal<string> = computed(() => {
    const listItems = this.vm().map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: it.url,
      name: it.title
    }));
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: listItems
    });
  });

  ngOnInit(): void {
    this.fetch();
    if (isPlatformBrowser(this.platformId)) {
      this.jsonLd();
    }
  }

  private fetch(): void {
    this.loading.set(true);
    this.error.set(null);
    this.srv.getRelatedPosts(this.postId, this.language, this.limit).subscribe({
      next: rows => {
        console.log('related posts', rows);
        this.items.set(rows ?? []);
        this.loading.set(false);
      },
      error: err => {
        console.error('related fetch error', err);
        this.error.set('Could not load related posts.');
        this.loading.set(false);
      }
    });
  }

  // template helpers
  trackById = (_: number, it: { id: number }) => it.id;
  trackByTagId = (_: number, t: { id: number }) => t.id;
}
