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

    {   path: 'en/aboutus',component: AboutUsComponent, data: { language: 'en' }  },
    {   path: 'de/aboutus',component: AboutUsComponent, data: { language: 'de' }  },
    {   path: 'ru/aboutus',component: AboutUsComponent, data: { language: 'ru' }  },
    {   path: 'tr/aboutus',component: AboutUsComponent, data: { language: 'tr' }  },

    {   path: 'en/services',component: ServicesComponent, data: { language: 'en' }  },
    {   path: 'de/services',component: ServicesComponent, data: { language: 'de' }  },
    {   path: 'ru/services',component: ServicesComponent, data: { language: 'ru' }  },
    {   path: 'tr/services',component: ServicesComponent, data: { language: 'tr' }  },

    {   path: 'en/gallery',component: GalleryComponent, data: { language: 'en' }  },
    {   path: 'de/gallery',component: GalleryComponent, data: { language: 'de' }  },
    {   path: 'ru/gallery',component: GalleryComponent, data: { language: 'ru' }  },
    {   path: 'tr/gallery',component: GalleryComponent, data: { language: 'tr' }  },

    {   path: 'en/contact',component: ContactUsComponent, data: { language: 'en' }  },
    {   path: 'de/contact',component: ContactUsComponent, data: { language: 'de' }  },
    {   path: 'ru/contact',component: ContactUsComponent, data: { language: 'ru' }  },
    {   path: 'tr/contact',component: ContactUsComponent, data: { language: 'tr' }  },

    {   path: 'en/blogs', component: BlogsComponent, data: { language: 'en' }  },
    {   path: 'de/blogs', component: BlogsComponent, data: { language: 'de' }  },
    {   path: 'ru/blogs', component: BlogsComponent, data: { language: 'ru' }  },
    {   path: 'tr/blogs', component: BlogsComponent, data: { language: 'tr' }  },

    // Blog routes
    // Antalya Airport Transfer
    {   path: 'en/blogs/antalya-airport-transfer',
        component: AntalyaAirportTransferComponent, 
        data: { language: 'en' }  
    },
    {   path: 'de/blogs/antalya-flughafentransfer',
        component: AntalyaAirportTransferComponent, 
        data: { language: 'de' }  
    },
    {   path: 'ru/blogs/transfer-aeroport-antalia',
        component: AntalyaAirportTransferComponent, 
        data: { language: 'ru' }  
    },
    {   path: 'tr/blogs/antalya-havalimani-transfer',
        component: AntalyaAirportTransferComponent, 
        data: { language: 'tr' }  
    },

    // Alanya Gazipasa Airport Transfer
    {   path: 'en/blogs/alanya-gazipasa-airport-transfer',
        component: AlanyaGazipasaAirportTransferComponent, 
        data: { language: 'en' }  
    },
    {   path: 'de/blogs/alanya-gazipasa-flughafentransfer',
        component: AlanyaGazipasaAirportTransferComponent, 
        data: { language: 'de' }  
    },
    {   path: 'ru/blogs/transfer-aeroport-alanya-gazipasa',
        component: AlanyaGazipasaAirportTransferComponent, 
        data: { language: 'ru' }  
    },
    {   path: 'tr/blogs/alanya-gazipasa-havalimani-transfer',
        component: AlanyaGazipasaAirportTransferComponent, 
        data: { language: 'tr' }  
    },

    // istanbul-sabiha-gokcen-airport-transfer
    // Istanbul Sabiha Gokcen Airport Transfer
    {   path: 'en/blogs/istanbul-sabiha-gokcen-airport-transfer',
        component: IstanbulAirportTransferComponent, 
        data: { language: 'en' }  
    },
    {   path: 'de/blogs/istanbul-sabiha-gokcen-flughafentransfer',
        component: IstanbulAirportTransferComponent, 
        data: { language: 'de' }  
    },
    {   path: 'ru/blogs/transfer-aeroport-stambul-sabiha-gokcen',
        component: IstanbulAirportTransferComponent, 
        data: { language: 'ru' }  
    },
    {   path: 'tr/blogs/istanbul-sabiha-gokcen-havalimani-transfer',
        component: IstanbulAirportTransferComponent, 
        data: { language: 'tr' }  
    },


    {
        path: ':lang/prices',component: PricesComponent,
    },
    {
        path: ':lang/booking',component: BookingComponent,
    },

    // Booking received
    {
        path: 'en/booking/received', 
        component: BookingReceivedComponent, 
        data: { language: 'en' }  
    },
    {
        path: 'de/booking/received', 
        component: BookingReceivedComponent, 
        data: { language: 'de' }  
    },
    {
        path: 'ru/booking/received', 
        component: BookingReceivedComponent, 
        data: { language: 'ru' }  
    },
    {
        path: 'tr/booking/received', 
        component: BookingReceivedComponent, 
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
        component: PasswordResetComponent,
    },
    {
        path: 'passwordresetconfirm',
        component: PasswordResetConfirmComponent,
    },
    {
        path: 'unauthorized',
        component: UnauthorizedComponent,
    },

    {   path: '**', redirectTo: 'en' }, // Redirect unknown paths

];
