// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdminHomeComponent } from './admin/pages/admin-home/admin-home.component';


export const serverRoutes: ServerRoute[] = [

    // {   path: '', 
    // renderMode: RenderMode.Server,
        
    //  },

    // {   path: 'en', 
    //     renderMode: RenderMode.Server, },
    // {   path: 'de', 
    //     renderMode: RenderMode.Server,},
    // {   path: 'ru',
    //     renderMode: RenderMode.Server,},
    // {   path: 'tr',    
    //     renderMode: RenderMode.Server,},

    // {
    //     path: 'en/about-24-7-private-airport-transfer-in-turkey', 
    //     renderMode: RenderMode.Server,
    //   },
    //   {
    //     path: 'de/über-24-7-privaten-flughafentransfer-in-der-türkei', 
    //     renderMode: RenderMode.Server,
    //   },
    //   {
    //     path: 'ru/о-24-7-частном-трансфере-из-аэропорта-в-турции', 
    //     renderMode: RenderMode.Server,
    //   },
    //   {
    //     path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-hakkında', 
    //     renderMode: RenderMode.Server,
    //   },

    // { path: 'en/services-of-24-7-private-airport-transfer-in-turkey', 
    //     renderMode: RenderMode.Server,},
    // { path: 'de/dienstleistungen-von-24-7-privatem-flughafentransfer-in-der-türkei', 
    //     renderMode: RenderMode.Server,},
    // { path: 'ru/услуги-24-7-частного-трансфера-из-аэропорта-в-турции', 
    //     renderMode: RenderMode.Server,},
    // { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-hizmetleri', 
    //     renderMode: RenderMode.Server,},

    // { path: 'en/gallery-of-24-7-private-airport-transfer-in-turkey', 
    //     renderMode: RenderMode.Server,},
    // { path: 'de/galerie-von-24-7-privatem-flughafentransfer-in-der-türkei', 
    //     renderMode: RenderMode.Server,},
    // { path: 'ru/галерея-24-7-частного-трансфера-из-аэропорта-в-турции', 
    //     renderMode: RenderMode.Server,},
    // { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-galerisi', 
    //     renderMode: RenderMode.Server,},

    // { path: 'en/contact-of-24-7-private-airport-transfer-in-turkey', 
    //     renderMode: RenderMode.Server,},
    // { path: 'de/kontakt-von-24-7-privatem-flughafentransfer-in-der-türkei', 
    //     renderMode: RenderMode.Server,},
    // { path: 'ru/контакт-24-7-частного-трансфера-из-аэропорта-в-турции', 
    //     renderMode: RenderMode.Server,},
    // { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-iletişim', 
    //     renderMode: RenderMode.Server,},

    // { path: 'en/turkey-24-7-private-airport-transfer-blogs', 
    //     renderMode: RenderMode.Server,},
    // { path: 'de/türkei-24-7-privater-flughafentransfer-blogs', 
    //     renderMode: RenderMode.Server,},
    // { path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции', 
    //     renderMode: RenderMode.Server,},
    // { path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları', 
    //     renderMode: RenderMode.Server,},

    // // Blog routes
    // // Antalya Airport Transfer
    // {   path: 'en/turkey-24-7-private-airport-transfer-blogs/antalya-24-7-private-airport-transfer',
    //     renderMode: RenderMode.Server,
    // },
    // {   path: 'de/türkei-24-7-privater-flughafentransfer-blogs/antalya-24-7-private-flughafentransfer',
    //     renderMode: RenderMode.Server,
    // },
    // {   path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции/24-7-частный-трансфер-аэропорт-анталья',
    //     renderMode: RenderMode.Server,
    // },
    // {   path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları/antalya-24-7-özel-havalimani-transfer',
    //     renderMode: RenderMode.Server,
    // },

    // // Alanya Gazipasa Airport Transfer
    // {   path: 'en/turkey-24-7-private-airport-transfer-blogs/alanya-gazipasa-24-7-private-airport-transfer',
    //     renderMode: RenderMode.Server,
    // },
    // {   path: 'de/türkei-24-7-privater-flughafentransfer-blogs/alanya-gazipasa-24-7-private-flughafentransfer',
    //     renderMode: RenderMode.Server,
    // },
    // // {   path: 'ru/blogs/transfer-aeroport-alanya-gazipasa',
    // {   path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции/24-7-частный-трансфер-аэропорт-аланья-газипаша',
    //     renderMode: RenderMode.Server,
    // },
    // {   path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları/alanya-gazipasa-7-24-özel-havalimani-transfer',
    //     renderMode: RenderMode.Server,
    // },

    // // istanbul-sabiha-gokcen-airport-transfer
    // // Istanbul Sabiha Gokcen Airport Transfer
    // {   path: 'en/turkey-24-7-private-airport-transfer-blogs/istanbul-sabiha-gokcen-24-7-private-airport-transfer',
    //     renderMode: RenderMode.Server,
    // },
    // {   path: 'de/türkei-24-7-privater-flughafentransfer-blogs/istanbul-sabiha-gokcen-24-7-private-flughafentransfer',
    //     renderMode: RenderMode.Server,
    // },
    // // {   path: 'ru/blogs/transfer-aeroport-stambul-sabiha-gokcen',
    // {   path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции/24-7-частный-трансфер-аэропорт-стамбул-сабиха-гёкчен',
    //     renderMode: RenderMode.Server,
    // },
    // {   path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları/istanbul-sabiha-gokcen-24-7-özel-havalimani-transfer',
    //     renderMode: RenderMode.Server,
    // },

    // // Prices
    // // { path: ':lang/prices',component: PricesComponent, },
    // // { path: ':lang/booking',component: BookingComponent, },
    // { path: 'en/affordable-prices-for-24-7-private-airport-transfers-in-turkey', 
    //     renderMode: RenderMode.Server,},
    // { path: 'de/bezahlbare-preise-für-24-7-privaten-flughafentransfer-in-der-türkei', 
    //     renderMode: RenderMode.Server,},
    // { path: 'ru/доступные-цены-на-круглосуточные-частные-трансферы-из-аэропорта-в-турции', 
    //     renderMode: RenderMode.Server,},
    // { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferleri-için-uygun-fiyatlar', 
    //     renderMode: RenderMode.Server,},
    
    // // Book Now
    // { path: 'en/book-now-24-7-private-airport-transfer-in-turkey', 
    //     renderMode: RenderMode.Server,},
    // { path: 'de/jetzt-buchen-24-7-privater-flughafentransfer-in-der-türkei', 
    //     renderMode: RenderMode.Server,},
    // { path: 'ru/забронировать-сейчас-24-7-частный-трансфер-из-аэропорта-в-турции', 
    //     renderMode: RenderMode.Server,},
    // { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-şimdi-rezervasyon-yap', 
    //     renderMode: RenderMode.Server,},

    // // Booking received
    // {
    //     path: 'en/book-now-24-7-private-airport-transfer-in-turkey/received', 
    //     renderMode: RenderMode.Server,
    // },
    // {
    //     path: 'de/jetzt-buchen-24-7-privater-flughafentransfer-in-der-türkei/received', 
    //     renderMode: RenderMode.Server,
    // },
    // {
    //     path: 'ru/забронировать-сейчас-24-7-частный-трансфер-из-аэропорта-в-турции/received', 
    //     renderMode: RenderMode.Server,
    // },
    // {
    //     path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-şimdi-rezervasyon-yap/received', 
    //     renderMode: RenderMode.Server,
    // },


    // // PRIVACY POLICY AND TERMS OF SERVICE
    // {
    //     path: 'en/privacy-policy-for-24-7-private-airport-private-car-transfer-in-turkey',
    //     renderMode: RenderMode.Server,
    // }, 
    // {
    //     path: 'de/datenschutz-bestimmungen-für-24-7-privaten-flughafen-privatwagen-transfer-in-der-türkei',
    //     renderMode: RenderMode.Server,
    // }, 
    // {
    //     path: 'ru/политика-конфиденциальности-для-24-7-частного-трансфера-частного-автомобиля-из-аэропорта-в-турции',
    //     renderMode: RenderMode.Server,
    // }, 
    // {
    //     path: 'tr/türkiye-de-7-24-havalimanı-özel-araba-transferi-için-gizlilik-politikası',
    //     renderMode: RenderMode.Server,
    // }, 
    // {
    //     path: 'en/terms-of-service-for-24-7-private-airport-private-car-transfer-in-turkey',
    //     renderMode: RenderMode.Server,
    // }, 
    // {
    //     path: 'de/nutzungsbedingungen-für-24-7-privaten-flughafen-privatwagen-transfer-in-der-türkei',
    //     renderMode: RenderMode.Server,
    // }, 
    // {
    //     path: 'ru/условия-обслуживания-для-24-7-частного-трансфера-частного-автомобиля-из-аэропорта-в-турции',
    //     renderMode: RenderMode.Server,
    // }, 
    // {
    //     path: 'tr/türkiye-de-7-24-havalimanı-özel-araba-transferi-için-hizmet-şartları',
    //     renderMode: RenderMode.Server,
    // },


    {
        path: 'admin',
        renderMode: RenderMode.Client
    },

    {
        path: 'passwordreset',
        renderMode: RenderMode.Prerender
    },
    {
        path: 'passwordresetconfirm',
        renderMode: RenderMode.Prerender
    },
    {
        path: 'unauthorized',
        renderMode: RenderMode.Prerender
    },

    // {   path: 'prices', 
    //     renderMode: RenderMode.Server, 
    // },
    {
    
        path: '**',
        renderMode: RenderMode.Server,
}
];