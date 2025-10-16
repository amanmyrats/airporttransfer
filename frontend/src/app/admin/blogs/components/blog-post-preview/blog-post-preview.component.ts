import { Component, inject, OnInit } from '@angular/core';
import { LocalizedBlogPost } from '../../models/localized-blog-post.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogVideoPublicComponent } from '../blog-video-public/blog-video-public.component';
import { TableOfContentsComponent } from '../table-of-contents/table-of-contents.component';
import { buildSectionAnchor } from '../shared/slug.utils';
import { RelatedPostsComponent } from '../related-posts/related-posts.component';
import { BlogSectionMapPublicComponent } from '../blog-section-map-public/blog-section-map-public.component';
import { ImageSectionPublicComponent } from '../../../../blogs/components/image-section-public/image-section-public.component';
import { FaqSectionPublicComponent } from '../../../../blogs/components/faq-section-public/faq-section-public.component';
import { DecodeHtmlPipe } from '../../../../pipes/decode-html.pipe';
import { BlogService } from '../../services/blog.service';
import { BookingFormComponent, BookingSearchEvent } from '../../../../components/booking-form/booking-form.component';
import { GoogleMapsService } from '../../../../services/google-maps.service';
import { BookingService } from '../../../../services/booking.service';
import { PriceCalculatorService } from '../../../../services/price-calculator.service';
import { NAVBAR_MENU } from '../../../../constants/navbar-menu.constants';

@Component({
  selector: 'app-blog-post-preview',
  imports: [
    CommonModule, 
    SelectButton, ButtonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    RouterLink, 
    ImageSectionPublicComponent, FaqSectionPublicComponent, 
    DecodeHtmlPipe, 
    BlogVideoPublicComponent, 
    TableOfContentsComponent, RelatedPostsComponent, 
    BlogSectionMapPublicComponent, BookingFormComponent, 
  ],
  templateUrl: './blog-post-preview.component.html',
  styleUrl: './blog-post-preview.component.scss'
})
export class BlogPostPreviewComponent implements OnInit {
  slug: string = '';
  
  currentLanguage: any = 'en';

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
    private route: ActivatedRoute,
    private googleMapsService: GoogleMapsService,
    private bookingService: BookingService,
    private priceCalculatorService: PriceCalculatorService,
    private router: Router,
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
    console.log('Navigating to booking with:', { formValue, distance, duration, airportCoefficient });
    console.log('Navigating to url:', `/${this.currentLanguage}/${NAVBAR_MENU.bookNow.slug[this.currentLanguage]}/`);
    return this.router.navigate(
      [`${this.currentLanguage}/${NAVBAR_MENU.bookNow.slug[this.currentLanguage]}/`],
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
