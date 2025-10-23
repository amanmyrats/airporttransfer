import { Component, Inject, inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { NAVBAR_MENU } from '../../../constants/navbar-menu.constants';
import { Meta, Title } from '@angular/platform-browser';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { ImageSectionPublicComponent } from '../image-section-public/image-section-public.component';
import { FaqSectionPublicComponent } from '../faq-section-public/faq-section-public.component';
import { DecodeHtmlPipe } from '../../../pipes/decode-html.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { BlogService } from '../../../admin/blogs/services/blog.service';
import { BlogVideoPublicComponent } from '../../../admin/blogs/components/blog-video-public/blog-video-public.component';
import { RelatedPostsComponent } from '../../../admin/blogs/components/related-posts/related-posts.component';
import { TableOfContentsComponent } from '../../../admin/blogs/components/table-of-contents/table-of-contents.component';
import { BlogSectionMapPublicComponent } from '../../../admin/blogs/components/blog-section-map-public/blog-section-map-public.component';
import { buildSectionAnchor } from '../../../admin/blogs/components/shared/slug.utils';
import { LocalizedBlogPost } from '../../../admin/blogs/models/localized-blog-post.model';
import { BookingFormComponent, BookingSearchEvent } from '../../../components/booking-form/booking-form.component';
import { GoogleMapsService } from '../../../services/google-maps.service';
import { BookingService } from '../../../services/booking.service';
import { PriceCalculatorService } from '../../../services/price-calculator.service';




@Component({
  selector: 'app-blog-detail-public',
  imports: [
    CommonModule, RouterModule, 
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
    NgOptimizedImage,
    ImageSectionPublicComponent, FaqSectionPublicComponent,  
    DecodeHtmlPipe, BlogVideoPublicComponent, 
    TableOfContentsComponent, RelatedPostsComponent, 
    BlogSectionMapPublicComponent, 
    BookingFormComponent, 
  ],
  templateUrl: './blog-detail-public.component.html',
  styleUrl: './blog-detail-public.component.scss'
})
export class BlogDetailPublicComponent implements OnInit {
  trailingMultilingualBlogSlug: { [key: string]: string } | null = null;
  navbarMenu = NAVBAR_MENU;

  public buildSectionAnchor = buildSectionAnchor;
  slug: string = '';
  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };
  blog: LocalizedBlogPost = {};

  constructor(
    private route: ActivatedRoute, 
    private blogService: BlogService, 
    private title: Title, 
    private meta: Meta, 
    private renderer: Renderer2,
    private router: Router,
    private googleMapsService: GoogleMapsService,
    private bookingService: BookingService,
    private priceCalculatorService: PriceCalculatorService,
    @Inject(DOCUMENT) private doc: Document,
    ) {
      combineLatest([this.route.paramMap, this.route.data])
      .pipe(
        map(([pm, data]) => ({
          slug: pm.get('slug') ?? '',
          lang: (data['language'] as string) ?? 'en'
        })),
        distinctUntilChanged((a, b) => a.slug === b.slug && a.lang === b.lang),
        takeUntilDestroyed() // constructor has injection context
      )
      .subscribe(({ slug, lang }) => {
        this.slug = slug;
        this.currentLanguage.code = lang;
        this.setMetaTags(lang);
        this.getBlogDetail();
      });
    }
    
    
  //   ngOnInit(): void {
  //   const languageCode = this.route.snapshot.data['language'] || 'en';
  //   this.currentLanguage.code = languageCode;
  //   this.slug = this.route.snapshot.paramMap.get('slug')!;

  //   console.log('Current Language:', this.currentLanguage);
  //   console.log('Blog Slug:', this.slug);
  //   this.getBlogDetail();

  //   this.setMetaTags(this.currentLanguage.code);

  // }

  ngOnInit(): void {
    // combineLatest([this.route.paramMap, this.route.data])
    //   .pipe(
    //     map(([pm, data]) => ({
    //       slug: pm.get('slug') ?? '',
    //       lang: (data['language'] as string) ?? 'en'
    //     })),
    //     // avoid duplicate loads when Angular re-emits the same values
    //     distinctUntilChanged((a, b) => a.slug === b.slug && a.lang === b.lang),
    //     takeUntilDestroyed()
    //   )
    //   .subscribe(({ slug, lang }) => {
    //     this.slug = slug;
    //     this.currentLanguage.code = lang;
  
    //     // Optional: set basic meta while loading (your API meta will overwrite)
    //     this.setMetaTags(lang);
  
    //     // Load fresh content for the new slug/lang
    //     this.getBlogDetail();
  
    //     // Optional: scroll to top for UX
    //     // window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    //   });
  }

  
  getBlogDetail() {
    this.blogService.getBySlug(this.slug, this.currentLanguage.code).subscribe({
      next: (data) => {
        this.blog = data;
        console.log('Blog Detail:', this.blog);

        // Set trailingMultilingualBlogSlug for language switcher

// hreflang_links: 
// de: "/de/turkey-airport-transfer-blogs/test-4"
// en: "/en/turkey-airport-transfer-blogs/test-2"
// ru: "/ru/turkey-airport-transfer-blogs/test-3"
// tr: "/tr/turkey-airport-transfer-blogs/test"
        this.trailingMultilingualBlogSlug = {};
        if (this.blog.hreflang_links) {
          for (const [lang, url] of Object.entries(this.blog.hreflang_links)) {
            const segments = url.split('/');
            // ex: ["", "de", "turkey-airport-transfer-blogs", "test-4"]
            if (segments.length >= 3) {
              this.trailingMultilingualBlogSlug[lang] = segments.slice(3).join('/');
              // ex: "test-4"
            }
          }
        }
        console.log('trailingMultilingualBlogSlug: ', this.trailingMultilingualBlogSlug);
        


        // Title/description from API translation when available
        const title = this.blog.translation?.seo_title || this.blog.translation?.title || '';
        const description =
          this.blog.translation?.seo_description || this.blog.translation?.short_description || '';

        this.title.setTitle(title);
        this.meta.updateTag({ name: 'description', content: description });

        // Canonical + hreflang from serializer
        this.setCanonical(this.blog.canonical_url);
        this.setHreflangLinks(this.blog.hreflang_links as Record<string, string> | undefined);


        // JSON-LD (BlogPosting)
        this.injectJsonLd(this.buildBlogPostingJsonLd());

        // Increment views AFTER first paint; prefer slug endpoint
        this.incrementViews();

      },
      error: (error) => {
        console.error('Error fetching blog detail:', error);
      }
    });
  }

  incrementViews() {
    this.blogService.incrementViews(this.blog.id!).subscribe({
      next: (data: any) => {
        console.log('Views incremented:', data);
      },
      error: (error: any) => {
        console.error('Error incrementing views:', error);
      }
    });
  }

  setMetaTags(langCode: string): void {
    const metaTags: any = {
      en: {
        title: 'About 24/7 Private Airport Transfer Services in Turkey | Antalya, Istanbul & More',
        description: 'Learn about affordable and reliable 24/7 private airport transfer services in Turkey. Covering Antalya, Istanbul, Alanya, and more. How to go with ease!',
      },
      de: {
      title: "Über 24/7 private Flughafentransfers in der Türkei | Antalya, Istanbul & mehr",
      description: "Erfahren Sie mehr über günstige und zuverlässige 24/7 private Flughafentransfers in der Türkei. Abdeckung von Antalya, Istanbul, Alanya und mehr. Reisen Sie stressfrei!"
      },
      ru: {
        title: "О круглосуточных частных трансферах из аэропорта в Турции | Анталия, Стамбул и другие",
        description: "Узнайте больше о доступных и надежных круглосуточных частных трансферах из аэропорта в Турции. Охватывает Анталию, Стамбул, Аланью и другие города. Путешествуйте с комфортом!"
      },
      tr: {
        title: "Türkiye'de 7/24 Özel Havalimanı Transfer Hizmetleri Hakkında | Antalya, İstanbul ve Daha Fazlası",
        description: "Türkiye'de uygun fiyatlı ve güvenilir 7/24 özel havalimanı transfer hizmetleri hakkında bilgi edinin. Antalya, İstanbul, Alanya ve daha fazlasını kapsıyor. Kolayca ulaşım sağlayın!"
      }
    };
    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
  


  private setCanonical(url?: string): void {
    if (!url) return;
    // Remove existing canonicals
    Array.from(this.doc.querySelectorAll('link[rel="canonical"]')).forEach(el => el.remove());
    const link = this.renderer.createElement('link');
    this.renderer.setAttribute(link, 'rel', 'canonical');
    this.renderer.setAttribute(link, 'href', url);
    this.renderer.appendChild(this.doc.head, link);
  }


  private setHreflangLinks(map?: Record<string, string>): void {
    if (!map) return;
    // Remove old alternates
    Array.from(this.doc.querySelectorAll('link[rel="alternate"][hreflang]')).forEach(el => el.remove());
    Object.entries(map).forEach(([lang, href]) => {
      const link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'alternate');
      this.renderer.setAttribute(link, 'hreflang', lang);
      this.renderer.setAttribute(link, 'href', href);
      this.renderer.appendChild(this.doc.head, link);
    });
  }


  private injectJsonLd(json: unknown): void {
    // Remove previous JSON-LD of this type for safety
    Array.from(this.doc.querySelectorAll('script[type="application/ld+json"].blogposting')).forEach(s => s.remove());
    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.addClass(script, 'blogposting');
    script.text = JSON.stringify(json);
    this.renderer.appendChild(this.doc.head, script);
  }
  private buildBlogPostingJsonLd(): unknown {
    const image = this.blog.main_image || this.blog.thumbnail;
    const title = this.blog.translation?.title || '';
    const description =
      this.blog.translation?.seo_description || this.blog.translation?.short_description || '';
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description,
      inLanguage: this.currentLanguage.code,
      image: image ? [image] : [],
      datePublished: this.blog.published_at,
      dateModified: this.blog.updated_at,
      author: { '@type': 'Organization', name: 'AirportTransferHub' },
      publisher: {
        '@type': 'Organization',
        name: 'AirportTransferHub',
        logo: { '@type': 'ImageObject', url: '/assets/logo.png' }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': this.blog.canonical_url || '' }
    };
  }
  onBookingSearch(event: BookingSearchEvent): void {
    const { formValue, complete, fail } = event;

    const origin: google.maps.LatLngLiteral = {
      lat: formValue.pickup_lat || 0,
      lng: formValue.pickup_lng || 0,
    };
    const destination: google.maps.LatLngLiteral = {
      lat: formValue.dest_lat || 0,
      lng: formValue.dest_lng || 0,
    };

    const pickupCoefficient = this.priceCalculatorService.getAirportCoefficient(
      formValue.pickup_lat,
      formValue.pickup_lng,
    );
    const destCoefficient = this.priceCalculatorService.getAirportCoefficient(
      formValue.dest_lat,
      formValue.dest_lng,
    );
    const airportCoefficient = Math.max(pickupCoefficient, destCoefficient);

    this.bookingService.bookingInitialForm
      .get('airport_coefficient')
      ?.setValue(airportCoefficient);
    this.bookingService.airportCoefficient.set(airportCoefficient);

    this.googleMapsService
      .calculateDrivingDistanceAndTime(origin, destination)
      .then(result =>
        this.navigateToBooking(formValue, result.distance, result.duration, airportCoefficient),
      )
      .catch(() =>
        this.navigateToBooking(formValue, 0, 0, airportCoefficient),
      )
      .then(() => complete())
      .catch(error => {
        console.error('Error processing booking form submission:', error);
        fail(error);
      });
  }

  private navigateToBooking(
    formValue: any,
    distance: number,
    duration: number,
    airportCoefficient: number,
  ) {
    return this.router.navigate(
      [`${this.currentLanguage.code}/${NAVBAR_MENU.bookNow.slug[this.currentLanguage.code]}/`],
      {
        queryParams: {
          step: 2,
          pickup_short: formValue.pickup_short,
          dest_short: formValue.dest_short,
          pickup_full: formValue.pickup_full,
          dest_full: formValue.dest_full,
          pickup_lat: formValue.pickup_lat,
          pickup_lng: formValue.pickup_lng,
          dest_lat: formValue.dest_lat,
          dest_lng: formValue.dest_lng,
          distance,
          driving_duration: duration,
          airport_coefficient: airportCoefficient,
        },
      },
    );
  }

}
