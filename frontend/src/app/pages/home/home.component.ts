import { afterNextRender, afterRender, AfterViewInit, Component, ElementRef, Inject, inject, Input, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
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
import { DevEnvComponent } from '../../components/dev-env/dev-env.component';
import { Testimonial, TESTIMONIALS } from '../../constants/testimonials.constants';
import { FooterPlaceholderComponent } from '../../components/footer-placeholder/footer-placeholder.component';
import { TestimonialListPlaceholderComponent } from '../../components/testimonial-list-placeholder/testimonial-list-placeholder.component';
import { BlogListPlaceholderComponent } from '../../components/blog-list-placeholder/blog-list-placeholder.component';
import { PriceListPlaceholderComponent } from '../../components/price-list-placeholder/price-list-placeholder.component';
import { Language } from '../../models/language.model';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,

    SuperHeaderComponent,
    NavbarComponent,
    BannerComponent,
    PriceListComponent, PriceListPlaceholderComponent, 
    CtaComponent, 
    TestimonialListComponent, TestimonialListPlaceholderComponent, 
    BlogListComponent, BlogListPlaceholderComponent, 
    FooterComponent, FooterPlaceholderComponent, 
    DevEnvComponent, 
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
  currentLanguage: Language = { ...SUPPORTED_LANGUAGES[0]! };
  mainLocations: any[] = SUPPORTED_MAIN_LOCATIONS;
  isBrowser: boolean;
  testimonialPlaceholderCount = 3;
  testimonialFullCount = Math.min(10, TESTIMONIALS.length);
  testimonialPreview: Testimonial[] = TESTIMONIALS.slice(0, this.testimonialPlaceholderCount);
  
  // private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  // private renderer = inject(Renderer2);

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
    const languageCode = this.route.snapshot.data['language'] as string | undefined;
    const resolved =
      SUPPORTED_LANGUAGES.find(({ code }) => code === languageCode) ?? SUPPORTED_LANGUAGES[0]!;
    this.currentLanguage = { ...resolved };

    this.setMetaTags(this.currentLanguage.code);

    // Inject preload links for SSR only
    if (isPlatformServer(this.platformId)) {
      const head = this.document.head;

      const sizes = [
        { key: 'image', media: '(min-width: 1200px)' },
        { key: 'imageM', media: '(max-width: 768px)' },
        { key: 'imageS', media: '(max-width: 480px)' }
      ];

      sizes.forEach(({ key, media }) => {
        const imageName = this.translations.banner[key].name[this.currentLanguage.code];
        const link = this.renderer.createElement('link');
        this.renderer.setAttribute(link, 'rel', 'preload');
        this.renderer.setAttribute(link, 'as', 'image');
        this.renderer.setAttribute(link, 'href', `images/${imageName}`);
        this.renderer.setAttribute(link, 'media', media);
        this.renderer.appendChild(head, link);
      });
  }
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
        title: 'Best 24/7 Istanbul, Antalya Airport Transfer Services in Turkey & More',
        description: 'Affordable and reliable 24/7 private airport transfer services in Turkey. Covering Antalya, Istanbul, Alanya, Izmir, and more. Book now for seamless travel!',
      },
      de: {
        title: "Beste 24/7 Flughafen-Transferdienste in Istanbul, Antalya und ganz Türkei",
        description: "Erschwingliche und zuverlässige 24/7 private Flughafentransfers in der Türkei. Abdeckung von Antalya, Istanbul, Alanya, Izmir und mehr. Buchen Sie jetzt für eine reibungslose Reise!"
      },
      ru: {
        title: "Круглосуточный Стамбул, Анталья Аэропорт Трансфер, и по всей Турции",
        description: "Доступные и надежные 24/7 частные трансферы из аэропорта в Турции. Охватываем Анталию, Стамбул, Аланью, Измир и другие города. Забронируйте сейчас для комфортного путешествия!"
      },
      tr: {
        title: "Türkiye genelinde 7/24 İstanbul, Antalya Havalimanı Transfer Hizmetleri ve Daha Fazlası",
        description: "Türkiye'de uygun fiyatlı ve güvenilir 7/24 özel havalimanı transfer hizmetleri. Antalya, İstanbul, Alanya, İzmir ve daha fazlasını kapsıyor. Sorunsuz bir yolculuk için hemen rezervasyon yapın!"
      }
    };

    const fallbackCode = SUPPORTED_LANGUAGES[0]!.code;
    const meta: any = metaTags[langCode] || metaTags[fallbackCode];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }


  translations: any = {
    banner: {
      title: {
        en: 'Hassle-Free 24/7 Private Airport Transfers in Turkey', 
        de: 'Stressfreie 24/7 Privat flughafen transfers in der Türkei',
        ru: 'Беззаботные круглосуточные 24/7 частные трансферы из аэропорта в Турции',
        tr: 'Türkiye\'de Sorunsuz 7/24 Özel Havalimanı Transferleri',
      }, 
      subtitle: {
        en: 'Reliable, affordable, and comfortable 24/7 private car rides to and from major Turkish airports.',
        de: 'Zuverlässige, erschwingliche und komfortable 24/7 Privatfahrten zu und von den wichtigsten türkischen Flughäfen.',
        ru: 'Надежные, доступные и комфортные 24/7 частные поездки на автомобиле крупных турецких аэропортов.',
        tr: 'Önde gelen Türk havalimanlarından ve havalimanlarına güvenilir, uygun fiyatlı ve konforlu 7/24 özel araçlarla ulaşım.',
      }, 
      image: {
        name: {
          en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya.webp',
          de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya.webp',
          ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья.webp',
          tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya.webp',
          
        }, 
        alt: {
          en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya',
          de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
          ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
          tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
        }
      }, 
      imageS: {
        name: {
          en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya-s.webp',
          de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya-s.webp',
          ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья-s.webp',
          tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya-s.webp',
        }, 
        alt: {
          en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya',
          de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
          ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
          tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
        }
      }, 
      imageM: {
        name: {
          en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya-m.webp',
          de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya-m.webp',
          ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья-m.webp',
          tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya-m.webp',
        }, 
        alt: {
          en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya', 
          de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
          ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
          tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
        }
      },
      imageJpg: {
        name: {
          en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya.jpg',
          de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya.jpg',
          ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья.jpg',
          tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya.jpg',
        }, 
        alt: {
          en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya',
          de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
          ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
          tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
        }
      },
    }
  };
}
  
