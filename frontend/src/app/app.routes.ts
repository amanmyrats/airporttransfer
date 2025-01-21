import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { ServicesComponent } from './pages/services/services.component';
import { PricesComponent } from './pages/prices/prices.component';
import { AppComponent } from './app.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { AdminHomeComponent } from './admin/pages/admin-home/admin-home.component';
import { BookingComponent } from './pages/booking/booking.component';
import { BookingReceivedComponent } from './pages/booking-received/booking-received.component';
import { PasswordResetComponent } from './admin/pages/password-reset/password-reset.component';
import { PasswordResetConfirmComponent } from './admin/pages/password-reset-confirm/password-reset-confirm.component';
import { UnauthorizedComponent } from './admin/pages/unauthorized/unauthorized.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { AntalyaAirportTransferComponent } from './pages/blogs/antalya-airport-transfer/antalya-airport-transfer.component';
import { AlanyaGazipasaAirportTransferComponent } from './pages/blogs/alanya-gazipasa-airport-transfer/alanya-gazipasa-airport-transfer.component';
import { IstanbulAirportTransferComponent } from './pages/blogs/istanbul-airport-transfer/istanbul-airport-transfer.component';

export const routes: Routes = [
    {   path: '', component: HomeComponent, data: { language: 'en' }  },

    {   path: 'en', component: HomeComponent, data: { language: 'en' }  },
    {   path: 'de', component: HomeComponent, data: { language: 'de' }  },
    {   path: 'ru', component: HomeComponent, data: { language: 'ru' }  },
    {   path: 'tr', component: HomeComponent, data: { language: 'tr' }  },

    // {   path: 'en/aboutus/',component: AboutUsComponent, data: { language: 'en' }  },
    // {   path: 'de/aboutus/',component: AboutUsComponent, data: { language: 'de' }  },
    // {   path: 'ru/aboutus/',component: AboutUsComponent, data: { language: 'ru' }  },
    // {   path: 'tr/aboutus/',component: AboutUsComponent, data: { language: 'tr' }  },

    {
        path: 'en/about-airport-transfer-in-turkey',
        loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
        data: { language: 'en' }
      },
      {
        path: 'de/über-flughafen-transfer-in-der-türkei',
        loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
        data: { language: 'de' }
      },
      {
        path: 'ru/о-трансфере-из-аэропорта-в-турции',
        loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
        data: { language: 'ru' }
      },
      {
        path: 'tr/türkiye-havalimanı-transferi-hakkında',
        loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
        data: { language: 'tr' }
      },

    // {   path: 'en/services',component: ServicesComponent, data: { language: 'en' }  },
    // {   path: 'de/services',component: ServicesComponent, data: { language: 'de' }  },
    // {   path: 'ru/services',component: ServicesComponent, data: { language: 'ru' }  },
    // {   path: 'tr/services',component: ServicesComponent, data: { language: 'tr' }  },
    { path: 'en/services-of-airport-transfer-in-turkey', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent), data: { language: 'en' } },
    { path: 'de/dienstleistungen-von-flughafen-transfer-in-der-türkei', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent), data: { language: 'de' } },
    { path: 'ru/услуги-трансфера-из-аэропорта-в-турции', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent), data: { language: 'ru' } },
    { path: 'tr/türkiye-havalimanı-transferi-hizmetleri', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent), data: { language: 'tr' } },

    // {   path: 'en/gallery',component: GalleryComponent, data: { language: 'en' }  },
    // {   path: 'de/gallery',component: GalleryComponent, data: { language: 'de' }  },
    // {   path: 'ru/gallery',component: GalleryComponent, data: { language: 'ru' }  },
    // {   path: 'tr/gallery',component: GalleryComponent, data: { language: 'tr' }  },
    { path: 'en/gallery-of-airport-transfer-in-turkey', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent), data: { language: 'en' } },
    { path: 'de/galerie-von-flughafen-transfer-in-der-türkei', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent), data: { language: 'de' } },
    { path: 'ru/галерея-трансфера-из-аэропорта-в-турции', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent), data: { language: 'ru' } },
    { path: 'tr/türkiye-havalimanı-transferi-galerisi', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent), data: { language: 'tr' } },

    // {   path: 'en/contact',component: ContactUsComponent, data: { language: 'en' }  },
    // {   path: 'de/contact',component: ContactUsComponent, data: { language: 'de' }  },
    // {   path: 'ru/contact',component: ContactUsComponent, data: { language: 'ru' }  },
    // {   path: 'tr/contact',component: ContactUsComponent, data: { language: 'tr' }  },
    { path: 'en/contact-of-airport-transfer-in-turkey', loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent), data: { language: 'en' } },
    { path: 'de/kontakt-von-flughafen-transfer-in-der-türkei', loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent), data: { language: 'de' } },
    { path: 'ru/контакт-трансфера-из-аэропорта-в-турции', loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent), data: { language: 'ru' } },
    { path: 'tr/türkiye-havalimanı-transferi-iletişim-bilgileri', loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent), data: { language: 'tr' } },

    // {   path: 'en/blogs', component: BlogsComponent, data: { language: 'en' }  },
    // {   path: 'de/blogs', component: BlogsComponent, data: { language: 'de' }  },
    // {   path: 'ru/blogs', component: BlogsComponent, data: { language: 'ru' }  },
    // {   path: 'tr/blogs', component: BlogsComponent, data: { language: 'tr' }  },
    { path: 'en/turkey-airport-transfer-blogs', loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent), data: { language: 'en' } },
    { path: 'de/flughafen-transfer-blogs-in-der-türkei', loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent), data: { language: 'de' } },
    { path: 'ru/блоги-о-трансфере-из-аэропорта-в-турции', loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent), data: { language: 'ru' } },
    { path: 'tr/türkiye-havalimanı-transfer-blogları', loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent), data: { language: 'tr' } },

    // Blog routes
    // Antalya Airport Transfer
    {   path: 'en/turkey-airport-transfer-blogs/antalya-airport-transfer',
        // component: AntalyaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/antalya-airport-transfer/antalya-airport-transfer.component').then(m => m.AntalyaAirportTransferComponent),
        data: { language: 'en' }  
    },
    {   path: 'de/flughafen-transfer-blogs-in-der-türkei/antalya-flughafentransfer',
        // component: AntalyaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/antalya-airport-transfer/antalya-airport-transfer.component').then(m => m.AntalyaAirportTransferComponent),
        data: { language: 'de' }  
    },
    // {   path: 'ru/blogs/transfer-aeroport-antalia',
    {   path: 'ru/блоги-о-трансфере-из-аэропорта-в-турции/трансфер-аэропорт-анталия',
    // {   path: 'ru/blogs/%D1%82%D1%80%D0%B0%D0%BD%D1%81%D1%84%D0%B5%D1%80-%D0%B0%D1%8D%D1%80%D0%BE%D0%BF%D0%BE%D1%80%D1%82-%D0%B0%D0%BD%D1%82%D0%B0%D0%BB%D0%B8%D1%8F',
        // component: AntalyaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/antalya-airport-transfer/antalya-airport-transfer.component').then(m => m.AntalyaAirportTransferComponent),
        data: { language: 'ru' }  
    },
    {   path: 'tr/türkiye-havalimanı-transfer-blogları/antalya-havalimani-transfer',
        // component: AntalyaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/antalya-airport-transfer/antalya-airport-transfer.component').then(m => m.AntalyaAirportTransferComponent),
        data: { language: 'tr' }  
    },

    // Alanya Gazipasa Airport Transfer
    {   path: 'en/turkey-airport-transfer-blogs/alanya-gazipasa-airport-transfer',
        // component: AlanyaGazipasaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/alanya-gazipasa-airport-transfer/alanya-gazipasa-airport-transfer.component').then(m => m.AlanyaGazipasaAirportTransferComponent),
        data: { language: 'en' }  
    },
    {   path: 'de/flughafen-transfer-blogs-in-der-türkei/alanya-gazipasa-flughafentransfer',
        // component: AlanyaGazipasaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/alanya-gazipasa-airport-transfer/alanya-gazipasa-airport-transfer.component').then(m => m.AlanyaGazipasaAirportTransferComponent),
        data: { language: 'de' }  
    },
    // {   path: 'ru/blogs/transfer-aeroport-alanya-gazipasa',
    {   path: 'ru/блоги-о-трансфере-из-аэропорта-в-турции/трансфер-аэропорт-аланья-газипаша',
        // component: AlanyaGazipasaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/alanya-gazipasa-airport-transfer/alanya-gazipasa-airport-transfer.component').then(m => m.AlanyaGazipasaAirportTransferComponent),
        data: { language: 'ru' }  
    },
    {   path: 'tr/türkiye-havalimanı-transfer-blogları/alanya-gazipasa-havalimani-transfer',
        // component: AlanyaGazipasaAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/alanya-gazipasa-airport-transfer/alanya-gazipasa-airport-transfer.component').then(m => m.AlanyaGazipasaAirportTransferComponent),
        data: { language: 'tr' }  
    },

    // istanbul-sabiha-gokcen-airport-transfer
    // Istanbul Sabiha Gokcen Airport Transfer
    {   path: 'en/turkey-airport-transfer-blogs/istanbul-sabiha-gokcen-airport-transfer',
        // component: IstanbulAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/istanbul-airport-transfer/istanbul-airport-transfer.component').then(m => m.IstanbulAirportTransferComponent),
        data: { language: 'en' }  
    },
    {   path: 'de/flughafen-transfer-blogs-in-der-türkei/istanbul-sabiha-gokcen-flughafentransfer',
        // component: IstanbulAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/istanbul-airport-transfer/istanbul-airport-transfer.component').then(m => m.IstanbulAirportTransferComponent),
        data: { language: 'de' }  
    },
    // {   path: 'ru/blogs/transfer-aeroport-stambul-sabiha-gokcen',
    {   path: 'ru/блоги-о-трансфере-из-аэропорта-в-турции/трансфер-аэропорт-стамбул-сабиха-гёкчен',
        // component: IstanbulAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/istanbul-airport-transfer/istanbul-airport-transfer.component').then(m => m.IstanbulAirportTransferComponent),
        data: { language: 'ru' }  
    },
    {   path: 'tr/türkiye-havalimanı-transfer-blogları/istanbul-sabiha-gokcen-havalimani-transfer',
        // component: IstanbulAirportTransferComponent, 
        loadComponent: () => import('./pages/blogs/istanbul-airport-transfer/istanbul-airport-transfer.component').then(m => m.IstanbulAirportTransferComponent),
        data: { language: 'tr' }  
    },

    // Prices
    // { path: ':lang/prices',component: PricesComponent, },
    // { path: ':lang/booking',component: BookingComponent, },
    { path: 'en/affordable-prices-for-airport-transfers-in-turkey', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'en' }   },
    { path: 'de/bezahlbare-preise-für-flughafentransfers-in-der-türkei', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'de' }   },
    { path: 'ru/доступные-цены-на-трансфер-из-аэропорта-в-турции', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'ru' }   },
    { path: 'tr/türkiye-de-havalimanı-transferleri-için-uygun-fiyatlar', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'tr' }   },
    { path: 'en/book-now-airport-transfer-in-turkey', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'en' }   },
    { path: 'de/jetzt-buchen-flughafen-transfer-in-der-türkei', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'de' }   },
    { path: 'ru/забронировать-сейчас-трансфер-из-аэропорта-в-турции', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'ru' }   },
    { path: 'tr/şimdi-rezervasyon-yap-türkiye-de-havalimanı-transferi', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'tr' }   },

    // Booking received
    {
        path: 'en/book-now-airport-transfer-in-turkey/received', 
        // component: BookingReceivedComponent, 
        loadComponent: () => import('./pages/booking-received/booking-received.component').then(m => m.BookingReceivedComponent),
        data: { language: 'en' }  
    },
    {
        path: 'de/jetzt-buchen-flughafen-transfer-in-der-türkei/received', 
        // component: BookingReceivedComponent, 
        loadComponent: () => import('./pages/booking-received/booking-received.component').then(m => m.BookingReceivedComponent),
        data: { language: 'de' }  
    },
    {
        path: 'ru/забронировать-сейчас-трансфер-из-аэропорта-в-турции/received', 
        // component: BookingReceivedComponent, 
        loadComponent: () => import('./pages/booking-received/booking-received.component').then(m => m.BookingReceivedComponent),
        data: { language: 'ru' }  
    },
    {
        path: 'tr/şimdi-rezervasyon-yap-türkiye-de-havalimanı-transferi/received', 
        // component: BookingReceivedComponent, 
        loadComponent: () => import('./pages/booking-received/booking-received.component').then(m => m.BookingReceivedComponent),
        data: { language: 'tr' }  
    },


    {
        path: 'admin',
        component: AdminHomeComponent, 
        loadChildren: () => import('./admin/admin.routes').then(x => x.adminRoutes),
        data: { noHydration: true },
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

    {   path: '**', redirectTo: '/en', pathMatch: 'full', data: { language: 'en' } }, // Redirect unknown paths

];
