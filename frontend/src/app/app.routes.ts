import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdminHomeComponent } from './admin/pages/admin-home/admin-home.component';
import { SsrTestComponent } from './components/ssr-test/ssr-test.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';

export const routes: Routes = [
    // {   path: 'en/aboutus/',component: AboutUsComponent, data: { language: 'en' }  },
    // {   path: 'de/aboutus/',component: AboutUsComponent, data: { language: 'de' }  },
    // {   path: 'ru/aboutus/',component: AboutUsComponent, data: { language: 'ru' }  },
    // {   path: 'tr/aboutus/',component: AboutUsComponent, data: { language: 'tr' }  },

    {
        path: 'en/about-24-7-private-airport-transfer-in-turkey',
        // loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
        component: AboutUsComponent,
        data: { language: 'en' }
      },
      {
        path: 'de/über-24-7-privaten-flughafentransfer-in-der-türkei',
        // loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
        component: AboutUsComponent,
        data: { language: 'de' }
      },
      {
        path: 'ru/о-24-7-частном-трансфере-из-аэропорта-в-турции',
        // loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
        component: AboutUsComponent,
        data: { language: 'ru' }
      },
      {
        path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-hakkında',
        // loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
        component: AboutUsComponent,
        data: { language: 'tr' }
      },

    // {   path: 'en/services',component: ServicesComponent, data: { language: 'en' }  },
    // {   path: 'de/services',component: ServicesComponent, data: { language: 'de' }  },
    // {   path: 'ru/services',component: ServicesComponent, data: { language: 'ru' }  },
    // {   path: 'tr/services',component: ServicesComponent, data: { language: 'tr' }  },
    { path: 'en/services-of-24-7-private-airport-transfer-in-turkey', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent), data: { language: 'en' } },
    { path: 'de/dienstleistungen-von-24-7-privatem-flughafentransfer-in-der-türkei', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent), data: { language: 'de' } },
    { path: 'ru/услуги-24-7-частного-трансфера-из-аэропорта-в-турции', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent), data: { language: 'ru' } },
    { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-hizmetleri', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent), data: { language: 'tr' } },

    // {   path: 'en/gallery',component: GalleryComponent, data: { language: 'en' }  },
    // {   path: 'de/gallery',component: GalleryComponent, data: { language: 'de' }  },
    // {   path: 'ru/gallery',component: GalleryComponent, data: { language: 'ru' }  },
    // {   path: 'tr/gallery',component: GalleryComponent, data: { language: 'tr' }  },
    { path: 'en/gallery-of-24-7-private-airport-transfer-in-turkey', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent), data: { language: 'en' } },
    { path: 'de/galerie-von-24-7-privatem-flughafentransfer-in-der-türkei', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent), data: { language: 'de' } },
    { path: 'ru/галерея-24-7-частного-трансфера-из-аэропорта-в-турции', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent), data: { language: 'ru' } },
    { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-galerisi', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent), data: { language: 'tr' } },

    // {   path: 'en/contact',component: ContactUsComponent, data: { language: 'en' }  },
    // {   path: 'de/contact',component: ContactUsComponent, data: { language: 'de' }  },
    // {   path: 'ru/contact',component: ContactUsComponent, data: { language: 'ru' }  },
    // {   path: 'tr/contact',component: ContactUsComponent, data: { language: 'tr' }  },
    { path: 'en/contact-of-24-7-private-airport-transfer-in-turkey', loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent), data: { language: 'en' } },
    { path: 'de/kontakt-von-24-7-privatem-flughafentransfer-in-der-türkei', loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent), data: { language: 'de' } },
    { path: 'ru/контакт-24-7-частного-трансфера-из-аэропорта-в-турции', loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent), data: { language: 'ru' } },
    { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-iletişim', loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent), data: { language: 'tr' } },

    // {   path: 'en/blogs', component: BlogsComponent, data: { language: 'en' }  },
    // {   path: 'de/blogs', component: BlogsComponent, data: { language: 'de' }  },
    // {   path: 'ru/blogs', component: BlogsComponent, data: { language: 'ru' }  },
    // {   path: 'tr/blogs', component: BlogsComponent, data: { language: 'tr' }  },
    { path: 'en/turkey-24-7-private-airport-transfer-blogs', loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent), data: { language: 'en' } },
    { path: 'de/türkei-24-7-privater-flughafentransfer-blogs', loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent), data: { language: 'de' } },
    { path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции', loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent), data: { language: 'ru' } },
    { path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları', loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent), data: { language: 'tr' } },

    // Blog routes
    // Antalya Airport Transfer
    {   path: 'en/turkey-24-7-private-airport-transfer-blogs/antalya-24-7-private-airport-transfer',
        // component: AntalyaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/antalya-airport-transfer/antalya-airport-transfer.component').then(m => m.AntalyaAirportTransferComponent),
        data: { language: 'en' }  
    },
    {   path: 'de/türkei-24-7-privater-flughafentransfer-blogs/antalya-24-7-private-flughafentransfer',
        // component: AntalyaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/antalya-airport-transfer/antalya-airport-transfer.component').then(m => m.AntalyaAirportTransferComponent),
        data: { language: 'de' }  
    },
    {   path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции/24-7-частный-трансфер-аэропорт-анталья',
        // component: AntalyaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/antalya-airport-transfer/antalya-airport-transfer.component').then(m => m.AntalyaAirportTransferComponent),
        data: { language: 'ru' }  
    },
    {   path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları/antalya-24-7-özel-havalimani-transfer',
        // component: AntalyaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/antalya-airport-transfer/antalya-airport-transfer.component').then(m => m.AntalyaAirportTransferComponent),
        data: { language: 'tr' }  
    },

    // Alanya Gazipasa Airport Transfer
    {   path: 'en/turkey-24-7-private-airport-transfer-blogs/alanya-gazipasa-24-7-private-airport-transfer',
        // component: AlanyaGazipasaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/alanya-gazipasa-airport-transfer/alanya-gazipasa-airport-transfer.component').then(m => m.AlanyaGazipasaAirportTransferComponent),
        data: { language: 'en' }  
    },
    {   path: 'de/türkei-24-7-privater-flughafentransfer-blogs/alanya-gazipasa-24-7-private-flughafentransfer',
        // component: AlanyaGazipasaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/alanya-gazipasa-airport-transfer/alanya-gazipasa-airport-transfer.component').then(m => m.AlanyaGazipasaAirportTransferComponent),
        data: { language: 'de' }  
    },
    // {   path: 'ru/blogs/transfer-aeroport-alanya-gazipasa',
    {   path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции/24-7-частный-трансфер-аэропорт-аланья-газипаша',
        // component: AlanyaGazipasaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/alanya-gazipasa-airport-transfer/alanya-gazipasa-airport-transfer.component').then(m => m.AlanyaGazipasaAirportTransferComponent),
        data: { language: 'ru' }  
    },
    {   path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları/alanya-gazipasa-7-24-özel-havalimani-transfer',
        // component: AlanyaGazipasaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/alanya-gazipasa-airport-transfer/alanya-gazipasa-airport-transfer.component').then(m => m.AlanyaGazipasaAirportTransferComponent),
        data: { language: 'tr' }  
    },

    // istanbul-sabiha-gokcen-airport-transfer
    // Istanbul Sabiha Gokcen Airport Transfer
    {   path: 'en/turkey-24-7-private-airport-transfer-blogs/istanbul-sabiha-gokcen-24-7-private-airport-transfer',
        // component: IstanbulAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/istanbul-airport-transfer/istanbul-airport-transfer.component').then(m => m.IstanbulAirportTransferComponent),
        data: { language: 'en' }  
    },
    {   path: 'de/türkei-24-7-privater-flughafentransfer-blogs/istanbul-sabiha-gokcen-24-7-private-flughafentransfer',
        // component: IstanbulAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/istanbul-airport-transfer/istanbul-airport-transfer.component').then(m => m.IstanbulAirportTransferComponent),
        data: { language: 'de' }  
    },
    // {   path: 'ru/blogs/transfer-aeroport-stambul-sabiha-gokcen',
    {   path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции/24-7-частный-трансфер-аэропорт-стамбул-сабиха-гёкчен',
        // component: IstanbulAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/istanbul-airport-transfer/istanbul-airport-transfer.component').then(m => m.IstanbulAirportTransferComponent),
        data: { language: 'ru' }  
    },
    {   path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları/istanbul-sabiha-gokcen-24-7-özel-havalimani-transfer',
        // component: IstanbulAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/istanbul-airport-transfer/istanbul-airport-transfer.component').then(m => m.IstanbulAirportTransferComponent),
        data: { language: 'tr' }  
    },

    // Prices
    // { path: ':lang/prices',component: PricesComponent, },
    // { path: ':lang/booking',component: BookingComponent, },
    { path: 'en/affordable-prices-for-24-7-private-airport-transfers-in-turkey', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'en' }   },
    { path: 'de/bezahlbare-preise-für-24-7-privaten-flughafentransfer-in-der-türkei', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'de' }   },
    { path: 'ru/доступные-цены-на-круглосуточные-частные-трансферы-из-аэропорта-в-турции', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'ru' }   },
    { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferleri-için-uygun-fiyatlar', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'tr' }   },
    
    // Book Now
    { path: 'en/book-now-24-7-private-airport-transfer-in-turkey', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'en' }   },
    { path: 'de/jetzt-buchen-24-7-privater-flughafentransfer-in-der-türkei', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'de' }   },
    { path: 'ru/забронировать-сейчас-24-7-частный-трансфер-из-аэропорта-в-турции', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'ru' }   },
    { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-şimdi-rezervasyon-yap', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'tr' }   },


    // // Simple Landing
    // {path: 'en/quick-and-easy-airport-transfer-booking-in-turkey-step-1', loadComponent: () => import('./pages/simple-landing/simple-landing.component').then(m => m.SimpleLandingComponent), data: { language: 'en' } },
    // {path: 'de/schnelle-und-einfache-buchung-von-flughafentransfers-in-der-türkei-schritt-1', loadComponent: () => import('./pages/simple-landing/simple-landing.component').then(m => m.SimpleLandingComponent), data: { language: 'de' } },
    // {path: 'ru/быстрое-и-простое-бронирование-трансфера-в-аэропорт-в-турции-шаг-1', loadComponent: () => import('./pages/simple-landing/simple-landing.component').then(m => m.SimpleLandingComponent), data: { language: 'ru' } },
    // {path: 'tr/türkiye-de-hızlı-ve-kolay-havalimanı-transferi-rezervasyonu-adım-1', loadComponent: () => import('./pages/simple-landing/simple-landing.component').then(m => m.SimpleLandingComponent), data: { language: 'tr' } },

    // {path: 'en/quick-and-easy-airport-transfer-booking-in-turkey-step-2', loadComponent: () => import('./pages/simple-landing-step-2/simple-landing-step-2.component').then(m => m.SimpleLandingStep2Component), data: { language: 'en' } },
    // {path: 'de/schnelle-und-einfache-buchung-von-flughafentransfers-in-der-türkei-schritt-2', loadComponent: () => import('./pages/simple-landing-step-2/simple-landing-step-2.component').then(m => m.SimpleLandingStep2Component), data: { language: 'de' } },
    // {path: 'ru/быстрое-и-простое-бронирование-трансфера-в-аэропорт-в-турции-шаг-2', loadComponent: () => import('./pages/simple-landing-step-2/simple-landing-step-2.component').then(m => m.SimpleLandingStep2Component), data: { language: 'ru' } },
    // {path: 'tr/türkiye-de-hızlı-ve-kolay-havalimanı-transferi-rezervasyonu-adım-2', loadComponent: () => import('./pages/simple-landing-step-2/simple-landing-step-2.component').then(m => m.SimpleLandingStep2Component), data: { language: 'tr' } },

    // {path: 'en/quick-and-easy-airport-transfer-booking-in-turkey-step-3', loadComponent: () => import('./pages/simple-landing-step-3/simple-landing-step-3.component').then(m => m.SimpleLandingStep3Component), data: { language: 'en' } },
    // {path: 'de/schnelle-und-einfache-buchung-von-flughafentransfers-in-der-türkei-schritt-3', loadComponent: () => import('./pages/simple-landing-step-3/simple-landing-step-3.component').then(m => m.SimpleLandingStep3Component), data: { language: 'de' } },
    // {path: 'ru/быстрое-и-простое-бронирование-трансфера-в-аэропорт-в-турции-шаг-3', loadComponent: () => import('./pages/simple-landing-step-3/simple-landing-step-3.component').then(m => m.SimpleLandingStep3Component), data: { language: 'ru' } },
    // {path: 'tr/türkiye-de-hızlı-ve-kolay-havalimanı-transferi-rezervasyonu-adım-3', loadComponent: () => import('./pages/simple-landing-step-3/simple-landing-step-3.component').then(m => m.SimpleLandingStep3Component), data: { language: 'tr' } },
    
    // Booking received
    {
        path: 'en/book-now-24-7-private-airport-transfer-in-turkey/received', 
        // component: BookingReceivedComponent, 
        loadComponent: () => import('./pages/booking-received/booking-received.component').then(m => m.BookingReceivedComponent),
        data: { language: 'en' }  
    },
    {
        path: 'de/jetzt-buchen-24-7-privater-flughafentransfer-in-der-türkei/received', 
        // component: BookingReceivedComponent, 
        loadComponent: () => import('./pages/booking-received/booking-received.component').then(m => m.BookingReceivedComponent),
        data: { language: 'de' }  
    },
    {
        path: 'ru/забронировать-сейчас-24-7-частный-трансфер-из-аэропорта-в-турции/received', 
        // component: BookingReceivedComponent, 
        loadComponent: () => import('./pages/booking-received/booking-received.component').then(m => m.BookingReceivedComponent),
        data: { language: 'ru' }  
    },
    {
        path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-şimdi-rezervasyon-yap/received', 
        // component: BookingReceivedComponent, 
        loadComponent: () => import('./pages/booking-received/booking-received.component').then(m => m.BookingReceivedComponent),
        data: { language: 'tr' }  
    },


    // PRIVACY POLICY AND TERMS OF SERVICE
    {
        path: 'en/privacy-policy-for-24-7-private-airport-private-car-transfer-in-turkey',
        // component: PrivacyPolicyComponent,
        loadComponent: () => import('./pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
        data: { language: 'en' }
    }, 
    {
        path: 'de/datenschutz-bestimmungen-für-24-7-privaten-flughafen-privatwagen-transfer-in-der-türkei',
        // component: PrivacyPolicyComponent,
        loadComponent: () => import('./pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
        data: { language: 'de' }
    }, 
    {
        path: 'ru/политика-конфиденциальности-для-24-7-частного-трансфера-частного-автомобиля-из-аэропорта-в-турции',
        // component: PrivacyPolicyComponent,
        loadComponent: () => import('./pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
        data: { language: 'ru' }
    }, 
    {
        path: 'tr/türkiye-de-7-24-havalimanı-özel-araba-transferi-için-gizlilik-politikası',
        // component: PrivacyPolicyComponent,
        loadComponent: () => import('./pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
        data: { language: 'tr' }
    }, 
    {
        path: 'en/terms-of-service-for-24-7-private-airport-private-car-transfer-in-turkey',
        // component: TermsOfServiceComponent,
        loadComponent: () => import('./pages/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent),
        data: { language: 'en' }
    }, 
    {
        path: 'de/nutzungsbedingungen-für-24-7-privaten-flughafen-privatwagen-transfer-in-der-türkei',
        // component: TermsOfServiceComponent,
        loadComponent: () => import('./pages/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent),
        data: { language: 'de' }
    }, 
    {
        path: 'ru/условия-обслуживания-для-24-7-частного-трансфера-частного-автомобиля-из-аэропорта-в-турции',
        // component: TermsOfServiceComponent,
        loadComponent: () => import('./pages/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent),
        data: { language: 'ru' }
    }, 
    {
        path: 'tr/türkiye-de-7-24-havalimanı-özel-araba-transferi-için-hizmet-şartları',
        // component: TermsOfServiceComponent,
        loadComponent: () => import('./pages/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent),
        data: { language: 'tr' }
    },


    {
        path: 'admin',
        component: AdminHomeComponent, 
        loadChildren: () => import('./admin/admin.routes').then(x => x.adminRoutes),
        data: { 
            noHydration: true, 
         },
    },

    {
        path: 'passwordreset',
        // component: PasswordResetComponent,
        loadComponent: () => import('./admin/pages/password-reset/password-reset.component').then(m => m.PasswordResetComponent), 
        data: { language: 'tr' }
    },
    {
        path: 'passwordresetconfirm',
        // component: PasswordResetConfirmComponent,
        loadComponent: () => import('./admin/pages/password-reset-confirm/password-reset-confirm.component').then(m => m.PasswordResetConfirmComponent), 
        data: { language: 'tr' }
    },
    {
        path: 'unauthorized',
        // component: UnauthorizedComponent,
        loadComponent: () => import('./admin/pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent), 
        data: { language: 'tr' }
    },

    {
        path: 'prices', 
        component: SsrTestComponent,
    },

    {
        path: 'blogs', 
        component: SsrTestComponent,
    },


    // 📰 Blog detail routes (localized category path + slug)
{
    path: 'en/turkey-airport-transfer-blogs/:slug',
    loadComponent: () => import('./blog/components/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
    data: { language: 'en' }
  },
  {
    path: 'de/turkei-flughafentransfer-blogs/:slug',
    loadComponent: () => import('./blog/components/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
    data: { language: 'de' }
  },
  {
    path: 'ru/трансфер-аэропорт-турция-блог/:slug',
    loadComponent: () => import('./blog/components/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
    data: { language: 'ru' }
  },
  {
    path: 'tr/turkiye-havalimani-transfer-bloglari/:slug',
    loadComponent: () => import('./blog/components/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
    data: { language: 'tr' }
  },

//   Blog list route
{
    path: 'en/turkey-airport-transfer-blogs',
    loadComponent: () => import('./blog/components/blog-list/blog-list.component').then(m => m.BlogListComponent),
    data: { language: 'en' }
  },
  {
    path: 'de/turkei-flughafentransfer-blogs',
    loadComponent: () => import('./blog/components/blog-list/blog-list.component').then(m => m.BlogListComponent),
    data: { language: 'de' }
  },
  {
    path: 'ru/трансфер-аэропорт-турция-блог',
    loadComponent: () => import('./blog/components/blog-list/blog-list.component').then(m => m.BlogListComponent),
    data: { language: 'ru' }
  },
  {
    path: 'tr/turkiye-havalimani-transfer-bloglari',
    loadComponent: () => import('./blog/components/blog-list/blog-list.component').then(m => m.BlogListComponent),
    data: { language: 'tr' }
  },






















    
  {   path: 'en', component: HomeComponent, data: { language: 'en' }  },
  {   path: 'de', component: HomeComponent, data: { language: 'de' }  },
  {   path: 'ru', component: HomeComponent, data: { language: 'ru' }  },
  {   path: 'tr', component: HomeComponent, data: { language: 'tr' }  },
  
  {   path: '', component: HomeComponent, data: { language: 'en' }  },
  
  {   path: '**', redirectTo: '/en', pathMatch: 'full', data: { language: 'en' } }, // Redirect unknown paths



  
];
