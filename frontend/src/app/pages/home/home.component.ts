import { afterNextRender, afterRender, AfterViewInit, Component, ElementRef, Inject, inject, Input, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { PriceListComponent } from '../../components/price-list/price-list.component';
import { BlogListComponent } from '../../components/blog-list/blog-list.component';
import { CtaComponent } from "../../components/cta/cta.component";
import { TestimonialListComponent } from '../../components/testimonial-list/testimonial-list.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LanguageService } from '../../services/language.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SUPPORTED_MAIN_LOCATIONS } from '../../constants/main-location.constants';
import { Meta, Title } from '@angular/platform-browser';
import { PricesLoadingComponent } from '../../components/prices-loading/prices-loading.component';

@Component({
  selector: 'app-home',
  imports: [FormsModule, SelectModule, ButtonModule,
    CommonModule,

    SuperHeaderComponent,
    NavbarComponent,
    BannerComponent,
    PriceListComponent,
    CtaComponent, 
    TestimonialListComponent, 
    BlogListComponent, 
    FooterComponent, 
    PricesLoadingComponent, 
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  // @ViewChild('banner', { static: true }) banner!: ElementRef;
  // @ViewChild('banner', { static: false }) banner!: ElementRef; // Use static: false
  @ViewChild('banner', { static: false, read: ElementRef }) banner!: ElementRef;

  private router! : Router;
  private languageService!: LanguageService;
  currentLanguage = {code: 'en', name: 'English', flag: 'flags/gb.svg'};
  mainLocations: any[] = SUPPORTED_MAIN_LOCATIONS;
  isBrowser: boolean;
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: any, 
    private route: ActivatedRoute, 
    private title: Title, 
    private meta: Meta, 
    private renderer: Renderer2, 
  ) {
    if (typeof window !== 'undefined') {
      this.router = inject(Router);
      this.languageService = inject(LanguageService);
    }
    this.isBrowser = isPlatformBrowser(this.platformId);
    afterNextRender(() => {
      if (window.innerWidth <= 768) { // Check if mobile
        setTimeout(() => { // Delay execution to ensure element is available
          this.scrollToBanner();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;

    this.setMetaTags(this.currentLanguage.code);
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit');
    // console.log('this.banner', this.banner);
    // console.log('window.innerWidth', window.innerWidth);
  }

  scrollToBanner() {
    // console.log('scrollToBanner');
    // console.log('this.banner', this.banner);
    // console.log('this.banner.nativeElement', this.banner.nativeElement);
    if (this.banner?.nativeElement) { // Ensure banner exists before scrolling
      this.banner.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  setMetaTags(langCode: string): void {
    const metaTags: any = {
      en: {
        title: 'Best 24/7 Private Airport Transfer Services in Turkey | Antalya, Istanbul & More',
        description: 'Affordable and reliable 24/7 private airport transfer services in Turkey. Covering Antalya, Istanbul, Alanya, Izmir, and more. Book now for seamless travel!',
      },
      de: {
        title: "Beste 24/7 private Flughafentransfers in der Türkei | Antalya, Istanbul & mehr",
        description: "Erschwingliche und zuverlässige 24/7 private Flughafentransfers in der Türkei. Abdeckung von Antalya, Istanbul, Alanya, Izmir und mehr. Buchen Sie jetzt für eine reibungslose Reise!"
      },
      ru: {
        title: "Лучшие 24/7 частные трансферы из аэропорта в Турции | Анталия, Стамбул и другие",
        description: "Доступные и надежные 24/7 частные трансферы из аэропорта в Турции. Охватываем Анталию, Стамбул, Аланью, Измир и другие города. Забронируйте сейчас для комфортного путешествия!"
      },
      tr: {
        title: "Türkiye'deki En İyi 7/24 Özel Havalimanı Transfer Hizmetleri | Antalya, İstanbul ve Daha Fazlası",
        description: "Türkiye'de uygun fiyatlı ve güvenilir 7/24 özel havalimanı transfer hizmetleri. Antalya, İstanbul, Alanya, İzmir ve daha fazlasını kapsıyor. Sorunsuz bir yolculuk için hemen rezervasyon yapın!"
      }
    };

    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
}
  