import { Component, inject, OnInit, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformServer, DOCUMENT } from '@angular/common';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CookieConsentComponent, 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'VIP Airport Transfers Turkey';
  // currentLanguage = {code: 'en', name: 'English', flag: 'flags/gb.svg'};

  private gtmService = inject(GoogleTagManagerService);
  private router = inject(Router);
  // private platformId = inject(PLATFORM_ID);
  // private document = inject(DOCUMENT);
  // private renderer = inject(Renderer2);

  constructor(
        private route: ActivatedRoute, 
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const gtmTag = {
          event: 'page_view',
          pagePath: event.urlAfterRedirects
        };
        // console.log('before Pushing GTM Tag:', gtmTag);
        this.gtmService.pushTag(gtmTag);
        // console.log('after Pushing GTM Tag:', gtmTag);
      }
    });
  }

  ngOnInit(): void {
    // const languageCode = this.route.snapshot.data['language'] || 'en';
    // this.currentLanguage.code = languageCode;

    // // Inject preload links for SSR only
    // if (isPlatformServer(this.platformId)) {
    //   const head = this.document.head;

    //   const sizes = [
    //     { key: 'image', media: '(min-width: 1200px)' },
    //     { key: 'imageM', media: '(max-width: 768px)' },
    //     { key: 'imageS', media: '(max-width: 480px)' }
    //   ];

    //   sizes.forEach(({ key, media }) => {
    //     const imageName = this.translations.banner[key].name[this.currentLanguage.code];
    //     const link = this.renderer.createElement('link');
    //     this.renderer.setAttribute(link, 'rel', 'preload');
    //     this.renderer.setAttribute(link, 'as', 'image');
    //     this.renderer.setAttribute(link, 'href', `images/${imageName}`);
    //     this.renderer.setAttribute(link, 'media', media);
    //     this.renderer.appendChild(head, link);
    //   });
    // }
  }

  // translations: any = {
  //   banner: {
  //     title: {
  //       en: 'Hassle-Free 24/7 Private Airport Transfers in Turkey', 
  //       de: 'Stressfreie 24/7 Privat flughafen transfers in der Türkei',
  //       ru: 'Беззаботные круглосуточные 24/7 частные трансферы из аэропорта в Турции',
  //       tr: 'Türkiye\'de Sorunsuz 7/24 Özel Havalimanı Transferleri',
  //     }, 
  //     subtitle: {
  //       en: 'Reliable, affordable, and comfortable 24/7 private car rides to and from major Turkish airports.',
  //       de: 'Zuverlässige, erschwingliche und komfortable 24/7 Privatfahrten zu und von den wichtigsten türkischen Flughäfen.',
  //       ru: 'Надежные, доступные и комфортные 24/7 частные поездки на автомобиле крупных турецких аэропортов.',
  //       tr: 'Önde gelen Türk havalimanlarından ve havalimanlarına güvenilir, uygun fiyatlı ve konforlu 7/24 özel araçlarla ulaşım.',
  //     }, 
  //     image: {
  //       name: {
  //         en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya.webp',
  //         de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya.webp',
  //         ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья.webp',
  //         tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya.webp',
          
  //       }, 
  //       alt: {
  //         en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya',
  //         de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
  //         ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
  //         tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
  //       }
  //     }, 
  //     imageS: {
  //       name: {
  //         en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya-s.webp',
  //         de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya-s.webp',
  //         ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья-s.webp',
  //         tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya-s.webp',
  //       }, 
  //       alt: {
  //         en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya',
  //         de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
  //         ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
  //         tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
  //       }
  //     }, 
  //     imageM: {
  //       name: {
  //         en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya-m.webp',
  //         de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya-m.webp',
  //         ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья-m.webp',
  //         tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya-m.webp',
  //       }, 
  //       alt: {
  //         en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya', 
  //         de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
  //         ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
  //         tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
  //       }
  //     },
  //     imageJpg: {
  //       name: {
  //         en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya.jpg',
  //         de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya.jpg',
  //         ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья.jpg',
  //         tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya.jpg',
  //       }, 
  //       alt: {
  //         en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya',
  //         de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
  //         ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
  //         tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
  //       }
  //     },
  //   }
  // };
  

}

