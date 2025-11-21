import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject, Renderer2, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, NgOptimizedImage, DOCUMENT } from '@angular/common';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { NAVBAR_MENU } from '../../../constants/navbar-menu.constants';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment as env } from '../../../../environments/environment';
import { LocalizedBlogPost } from '../../../admin/blogs/models/localized-blog-post.model';
import { BlogCategory } from '../../../admin/blogs/models/blog-category.model';
import { BlogTag } from '../../../admin/blogs/models/blog-tag.model';
import { BlogCategoryService } from '../../../admin/blogs/services/blog-category.service';
import { BlogService } from '../../../admin/blogs/services/blog.service';
import { CommonService } from '../../../services/common.service';
import { LazyLoadParams } from '../../../interfaces/custom-lazy-load-event';
import { SUPPORTED_LANGUAGES } from '../../../constants/language.contants';
import { Language } from '../../../models/language.model';

@Component({
  selector: 'app-blog-list-public',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgOptimizedImage,
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent,
    FormsModule, ReactiveFormsModule, 
  ],
  templateUrl: './blog-list-public.component.html',
  styleUrl: './blog-list-public.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListPublicComponent implements OnInit {
  
  // Pagination
  first: number = 0;
  rows: number = 2;
  totalRecords: number = 0;
  
  navbarMenu = NAVBAR_MENU;
  blogPosts: LocalizedBlogPost[] = [];
  blogCategories: BlogCategory[] = [];

  currentLanguage: Language = { ...SUPPORTED_LANGUAGES[0]! };
  translations: Record<string, Record<string, string>> = {
    sectionAriaLabel: {
      en: 'Blog list',
      de: 'Blogliste',
      ru: 'Список блогов',
      tr: 'Blog listesi',
    },
    headerTitle: {
      en: 'Travel Tips & Guides',
      de: 'Reisetipps & Guides',
      ru: 'Путевые советы и гиды',
      tr: 'Seyahat İpuçları & Rehberleri',
    },
    headerSubtitle: {
      en: 'Explore blogs about airport transfers, Turkish destinations, and insider travel tips.',
      de: 'Entdecken Sie Blogs über Flughafentransfers, türkische Reiseziele und Insider-Reisetipps.',
      ru: 'Исследуйте блоги о трансферах из аэропорта, направлениях в Турции и лайфхаках путешественников.',
      tr: 'Havalimanı transferleri, Türkiye destinasyonları ve içeriden seyahat ipuçlarını keşfedin.',
    },
    categoriesAll: {
      en: 'All',
      de: 'Alle',
      ru: 'Все',
      tr: 'Tümü',
    },
    searchPlaceholder: {
      en: 'Search blog posts...',
      de: 'Blogbeiträge durchsuchen...',
      ru: 'Поиск записей блога...',
      tr: 'Blog yazılarında ara...',
    },
    searchAriaLabel: {
      en: 'Search blog posts',
      de: 'Blogbeiträge durchsuchen',
      ru: 'Поиск записей блога',
      tr: 'Blog yazılarında ara',
    },
    searchButton: {
      en: 'Search',
      de: 'Suchen',
      ru: 'Найти',
      tr: 'Ara',
    },
    clearSearch: {
      en: 'Clear search',
      de: 'Suche löschen',
      ru: 'Очистить поиск',
      tr: 'Aramayı temizle',
    },
    removeTag: {
      en: 'Remove tag',
      de: 'Tag entfernen',
      ru: 'Убрать тег',
      tr: 'Etiketi kaldır',
    },
    sortBy: {
      en: 'Sort by',
      de: 'Sortieren nach',
      ru: 'Сортировать по',
      tr: 'Sırala',
    },
    sortNewest: {
      en: 'Newest',
      de: 'Neueste',
      ru: 'Сначала новые',
      tr: 'En yeni',
    },
    sortOldest: {
      en: 'Oldest',
      de: 'Älteste',
      ru: 'Сначала старые',
      tr: 'En eski',
    },
    sortMostViewed: {
      en: 'Most viewed',
      de: 'Meistgelesen',
      ru: 'Самые просматриваемые',
      tr: 'En çok görüntülenen',
    },
    sortFeaturedFirst: {
      en: 'Featured first',
      de: 'Highlights zuerst',
      ru: 'Сначала избранные',
      tr: 'Öne çıkanlar önce',
    },
    hasVideo: {
      en: 'Has video',
      de: 'Mit Video',
      ru: 'Есть видео',
      tr: 'Video var',
    },
    clearAll: {
      en: 'Clear all',
      de: 'Alle löschen',
      ru: 'Сбросить всё',
      tr: 'Tümünü temizle',
    },
    filters: {
      en: 'Filters',
      de: 'Filter',
      ru: 'Фильтры',
      tr: 'Filtreler',
    },
    tagsAriaLabel: {
      en: 'Tags',
      de: 'Tags',
      ru: 'Теги',
      tr: 'Etiketler',
    },
    viewsLabel: {
      en: 'views',
      de: 'Aufrufe',
      ru: 'просмотров',
      tr: 'görüntülenme',
    },
    emptyState: {
      en: 'No posts yet.',
      de: 'Noch keine Beiträge.',
      ru: 'Пока нет записей.',
      tr: 'Henüz yazı yok.',
    },
    pagerAriaLabel: {
      en: 'Blog pagination',
      de: 'Blog-Seiten',
      ru: 'Пагинация блога',
      tr: 'Blog sayfalandırma',
    },
    firstPage: {
      en: 'First page',
      de: 'Erste Seite',
      ru: 'Первая страница',
      tr: 'İlk sayfa',
    },
    prevPage: {
      en: 'Previous page',
      de: 'Vorherige Seite',
      ru: 'Предыдущая страница',
      tr: 'Önceki sayfa',
    },
    nextPage: {
      en: 'Next page',
      de: 'Nächste Seite',
      ru: 'Следующая страница',
      tr: 'Sonraki sayfa',
    },
    lastPage: {
      en: 'Last page',
      de: 'Letzte Seite',
      ru: 'Последняя страница',
      tr: 'Son sayfa',
    },
    showLabel: {
      en: 'Show',
      de: 'Anzeigen',
      ru: 'Показать',
      tr: 'Göster',
    },
    perPageLabel: {
      en: 'per page',
      de: 'pro Seite',
      ru: 'на страницу',
      tr: 'sayfa başına',
    },
    pageLabel: {
      en: 'Page',
      de: 'Seite',
      ru: 'Страница',
      tr: 'Sayfa',
    },
    ofLabel: {
      en: 'of',
      de: 'von',
      ru: 'из',
      tr: '/',
    },
  };

  translate(key: keyof typeof this.translations): string {
    const dict = this.translations[key];
    if (!dict) {
      return '';
    }
    return dict[this.currentLanguage.code] ?? dict['en'] ?? '';
  }


  searchTerm = '';
  selectedCategory = '';
  selectedTag: string | null = null;
  selectedTagName: string | null = null;  // for showing a nice chip label


  // paging (use your existing rows default, e.g. 9)
  pageSize = env.pagination.defaultBlogPageSize;        // rows
  page = 1;   
           // 1-based
  // NEW state
  ordering = '-published_at';       // default: Newest
  hasVideo = false;                 // toggle
  // state
  filtersOpen = false;

  // event object for CommonService
  event: LazyLoadParams = { first: 0, rows: this.pageSize, filters: {} };
  commonService = inject(CommonService);
  router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private title: Title,
    private meta: Meta,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private doc: Document,
    private categoryService: BlogCategoryService, 
  ) {}

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || SUPPORTED_LANGUAGES[0]!.code;
    const resolved =
      SUPPORTED_LANGUAGES.find(({ code }) => code === languageCode) ?? SUPPORTED_LANGUAGES[0]!;
    this.currentLanguage = { ...resolved };


    // read initial params if needed
    const qp = this.route.snapshot.queryParamMap;
    this.page = +(qp.get('page') || 1);
    this.pageSize = +(qp.get('page_size') || this.pageSize);
    this.searchTerm = qp.get('search') || '';
    this.selectedCategory = qp.get('category') || '';
    this.selectedTag = qp.get('tag');               // 👈 watch tag
    this.ordering = this.route.snapshot.queryParamMap.get('ordering') || this.ordering;  // NEW

    // sync event with URL state
    this.event.rows = this.pageSize;
    this.event.first = (this.page - 1) * this.pageSize;
    this.event.filters = {
      ...(this.searchTerm ? { search: this.searchTerm } : {}),
      ...(this.selectedCategory ? { category: this.selectedCategory } : {}),
      ...(this.selectedTag ? { tag: this.selectedTag } : {}),   // 👈 NEW
      ...(this.ordering ? { ordering: this.ordering } : {}),       // NEW
      ...(this.hasVideo ? { has_video: 1 } : {}),                   // NEW
    } as any;


    this.getCategories();
    this.loadWithEvent();
    // this.loadPosts();
    this.setMetaTags();
    this.setCanonicalAndJsonLd();
  }

  /** Build query string from event via CommonService and call API */
  private loadWithEvent(): void {
    const qs = this.commonService.buildPaginationParams(this.event); // ?page=&page_size=&...filters
    this.loadPosts(qs); // your existing method that appends &lang=xx and calls service
  }

  loadPosts(queryString: string=''): void {
    // Add lang=this.currentLanguage.code to the query string
    if (queryString) {
      queryString += `&lang=${this.currentLanguage.code}`;
    } else {
      queryString = `?lang=${this.currentLanguage.code}`;
    }
    this.blogService.getLocalizedList(queryString).subscribe({
      next: (data) => {
        this.blogPosts = data?.results ?? [];
        console.log('Fetched blog posts:', this.blogPosts);

        this.totalRecords = data?.count ?? 0;

        // update URL
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(this.page));
        url.searchParams.set('page_size', String(this.pageSize));
        if (this.searchTerm) url.searchParams.set('search', this.searchTerm); else url.searchParams.delete('search');
        if (this.selectedCategory) url.searchParams.set('category', this.selectedCategory); else url.searchParams.delete('category');
        if (this.selectedTag) url.searchParams.set('tag', this.selectedTag); else url.searchParams.delete('tag'); // 👈 NEW
        if (this.ordering) url.searchParams.set('ordering', this.ordering); else url.searchParams.delete('ordering');  // NEW
        if (this.hasVideo) url.searchParams.set('has_video', '1'); else url.searchParams.delete('has_video');           // NEW
        
        window.history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString());



        this.cdr.markForCheck();
        // After data arrives, (re)build ItemList JSON-LD with actual items
        this.injectItemListJsonLd();
      },
      error: (error) => console.error('Error fetching blog posts:', error)
    });
  }

  getCategories(): void {
    this.categoryService.getAll('', this.currentLanguage.code).subscribe({
      next: (data) => {
        this.blogCategories = data?.results ?? [];
        console.log('Blog categories:', this.blogCategories);
        this.cdr.markForCheck();
      },
      error: (error) => console.error('Error fetching blog categories:', error)
    });
  }

  trackById = (_: number, item: LocalizedBlogPost) => item.id;

  /* ---------- SEO head ---------- */
  private setMetaTags(): void {
    const dict = {
      en: {
        title: 'Travel Tips & Guides • Private Airport Transfers in Turkey',
        description: 'Explore expert tips on airport transfers, Istanbul & Antalya travel, routes, and pricing. Learn how to get from A to B with comfort and reliability.',
      },
      de: {
        title: 'Reisetipps & Guides • Private Flughafentransfers in der Türkei',
        description: 'Tipps zu Flughafentransfers, Reisen in Istanbul & Antalya, Routen und Preise. Komfortabel & zuverlässig ankommen.',
      },
      ru: {
        title: 'Путевые советы и гиды • Частные трансферы в Турции',
        description: 'Советы по трансферам из аэропорта, путешествиям в Стамбул и Анталью, маршрутам и ценам. Комфорт и надежность.',
      },
      tr: {
        title: 'Seyahat İpuçları & Rehberler • Türkiye Özel Havalimanı Transferleri',
        description: 'Havalimanı transferleri, İstanbul & Antalya seyahati, güzergâhlar ve fiyatlar hakkında ipuçları. Konfor ve güvenilirlik.',
      }
    } as Record<string, {title:string; description:string}>;
    const m = dict[this.currentLanguage.code] ?? dict['en'];
    this.title.setTitle(m.title);
    this.meta.updateTag({ name: 'description', content: m.description });
  }

  private setCanonicalAndJsonLd(): void {
    // canonical for list page
    const base = `${location.origin}/${this.currentLanguage.code}/turkey-airport-transfer-blogs`;
    Array.from(this.doc.querySelectorAll('link[rel="canonical"]')).forEach(el => el.remove());
    const link = this.renderer.createElement('link');
    this.renderer.setAttribute(link, 'rel', 'canonical');
    this.renderer.setAttribute(link, 'href', base);
    this.renderer.appendChild(this.doc.head, link);

    // BreadcrumbList JSON-LD (Home → Blogs)
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${location.origin}/${this.currentLanguage.code}` },
        { '@type': 'ListItem', 'position': 2, 'name': 'Blogs', 'item': base }
      ]
    };
    this.injectJsonLd(breadcrumb, 'breadcrumbs');
  }

  private injectItemListJsonLd(): void {
    const baseListUrl = `${location.origin}/${this.currentLanguage.code}/turkey-airport-transfer-blogs`;
    const items = (this.blogPosts ?? []).map((b, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${location.origin}/${this.currentLanguage.code}/turkey-airport-transfer-blogs/${b.translation?.slug || ''}`,
      name: b.translation?.title || '',
    }));
    const json = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListOrder: 'http://schema.org/ItemListUnordered',
      name: 'Travel Tips & Guides',
      url: baseListUrl,
      numberOfItems: items.length,
      itemListElement: items
    };
    this.injectJsonLd(json, 'itemlist');
  }

  private injectJsonLd(data: unknown, cls: string): void {
    Array.from(this.doc.querySelectorAll(`script[type="application/ld+json"].${cls}`)).forEach(s => s.remove());
    const script = this.renderer.createElement('script');
    this.renderer.addClass(script, cls);
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    script.text = JSON.stringify(data);
    this.renderer.appendChild(this.doc.head, script);
  }

  selectCategory(catId: string) {
    this.selectedCategory = catId;
    this.onSearch();
  }

  /** Search & category (plain HTML) */
  onSearch(): void {
    this.page = 1;
    this.event.first = 0;
    this.event.rows = this.pageSize;
    this.event.filters = {
      ...(this.searchTerm ? { search: this.searchTerm } : {}),
      ...(this.selectedCategory ? { category: this.selectedCategory } : {}),
      ...(this.selectedTag ? { tag: this.selectedTag } : {}),      // 👈 NEW

    } as any;
    this.loadWithEvent();
  }

  onClear(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  /** Pagination handlers (update event.first/rows, not page directly) */
  get totalPages(): number {
    return Math.max(1, Math.ceil((this.totalRecords || 0) / this.pageSize));
  }

  goToPage(n: number): void {
    const target = Math.min(Math.max(1, n), this.totalPages);
    if (target === this.page) return;
    this.page = target;
    this.event.rows = this.pageSize;
    this.event.first = (this.page - 1) * this.pageSize;
    this.loadWithEvent();
  }
  firstPage() { this.goToPage(1); }
  lastPage()  { this.goToPage(this.totalPages); }
  prevPage()  { this.goToPage(this.page - 1); }
  nextPage()  { this.goToPage(this.page + 1); }

  /** window of page numbers */
  get pageWindow(): number[] {
    const span = 5;
    const half = Math.floor(span / 2);
    let start = Math.max(1, this.page - half);
    let end = Math.min(this.totalPages, start + span - 1);
    if (end - start + 1 < span) start = Math.max(1, end - span + 1);
    const out: number[] = [];
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  }
  
  applyTag(tag: BlogTag | string) {
    const val = typeof tag === 'string' ? tag : tag.id?.toString() ?? '';
    const resolvedName = typeof tag === 'string' ? ''  : (tag as BlogTag).resolved?.name ?? (tag as BlogTag).name ?? '';
    const name = resolvedName ? resolvedName.toLowerCase() : '';
  
    // Toggle off if same tag clicked
    if (this.selectedTag === val) {
      this.clearTag();
      return;
    }
  
    this.selectedTag = val;
    this.selectedTagName = name || null;
  
    this.page = 1;
    this.event.first = 0;
    this.event.rows = this.pageSize;
    this.event.filters = {
      ...(this.searchTerm ? { search: this.searchTerm } : {}),
      ...(this.selectedCategory ? { category: this.selectedCategory } : {}),
      ...(val ? { tag: val } : {}),
    } as any;
  
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tag: val, page: 1 },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  
    this.loadWithEvent();
  }
  
  clearTag() {
    this.selectedTag = null;
    this.selectedTagName = null;
  
    this.page = 1;
    this.event.first = 0;
    this.event.rows = this.pageSize;
    this.event.filters = {
      ...(this.searchTerm ? { search: this.searchTerm } : {}),
      ...(this.selectedCategory ? { category: this.selectedCategory } : {}),
      // no tag
    } as any;
  
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tag: null, page: 1 }, // remove tag from URL
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  
    this.loadWithEvent();
  }
  
  
// NEW handlers
onSortChange() {
  this.page = 1;
  this.event.first = 0;
  this.event.rows = this.pageSize;
  this.event.filters = {
    ...(this.searchTerm ? { search: this.searchTerm } : {}),
    ...(this.selectedCategory ? { category: this.selectedCategory } : {}),
    ...(this.selectedTag ? { tag: this.selectedTag } : {}),
    ...(this.ordering ? { ordering: this.ordering } : {}),
    ...(this.hasVideo ? { has_video: 1 } : {}),
  } as any;
  this.loadWithEvent();
}

toggleHasVideo(checked: boolean) {
  this.hasVideo = checked;
  this.onSortChange(); // reuse to rebuild + reload
}
clearAllFilters() {
  this.searchTerm = '';
  this.selectedCategory = '';
  this.selectedTag = null;
  this.selectedTagName = null;
  this.ordering = '-published_at';
  this.hasVideo = false;

  this.page = 1;
  this.event.first = 0;
  this.event.rows = this.pageSize;
  this.event.filters = { ordering: this.ordering } as any; // minimal defaults
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: { search: null, category: null, tag: null, has_video: null, ordering: this.ordering, page: 1 },
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });
  this.loadWithEvent();
}
}
