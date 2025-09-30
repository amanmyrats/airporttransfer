// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdminHomeComponent } from './admin/pages/admin-home/admin-home.component';


export const serverRoutes: ServerRoute[] = [
    {
        path: 'en/about-24-7-private-airport-transfer-in-turkey', 
        renderMode: RenderMode.Prerender,
      },
      {
        path: 'de/über-24-7-privaten-flughafentransfer-in-der-türkei', 
        renderMode: RenderMode.Prerender,
      },
      {
        path: 'ru/о-24-7-частном-трансфере-из-аэропорта-в-турции', 
        renderMode: RenderMode.Prerender,
      },
      {
        path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-hakkında', 
        renderMode: RenderMode.Prerender,
      },

    { path: 'en/services-of-24-7-private-airport-transfer-in-turkey', 
        renderMode: RenderMode.Prerender,},
    { path: 'de/dienstleistungen-von-24-7-privatem-flughafentransfer-in-der-türkei', 
        renderMode: RenderMode.Prerender,},
    { path: 'ru/услуги-24-7-частного-трансфера-из-аэропорта-в-турции', 
        renderMode: RenderMode.Prerender,},
    { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-hizmetleri', 
        renderMode: RenderMode.Prerender,},

    { path: 'en/gallery-of-24-7-private-airport-transfer-in-turkey', 
        renderMode: RenderMode.Prerender,},
    { path: 'de/galerie-von-24-7-privatem-flughafentransfer-in-der-türkei', 
        renderMode: RenderMode.Prerender,},
    { path: 'ru/галерея-24-7-частного-трансфера-из-аэропорта-в-турции', 
        renderMode: RenderMode.Prerender,},
    { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-galerisi', 
        renderMode: RenderMode.Prerender,},

    { path: 'en/contact-of-24-7-private-airport-transfer-in-turkey', 
        renderMode: RenderMode.Prerender,},
    { path: 'de/kontakt-von-24-7-privatem-flughafentransfer-in-der-türkei', 
        renderMode: RenderMode.Prerender,},
    { path: 'ru/контакт-24-7-частного-трансфера-из-аэропорта-в-турции', 
        renderMode: RenderMode.Prerender,},
    { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-iletişim', 
        renderMode: RenderMode.Prerender,},

    { path: 'en/turkey-24-7-private-airport-transfer-blogs', 
        renderMode: RenderMode.Prerender,},
    { path: 'de/türkei-24-7-privater-flughafentransfer-blogs', 
        renderMode: RenderMode.Prerender,},
    { path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции', 
        renderMode: RenderMode.Prerender,},
    { path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları', 
        renderMode: RenderMode.Prerender,},

    // Blog routes
    // Antalya Airport Transfer
    {   path: 'en/turkey-24-7-private-airport-transfer-blogs/antalya-24-7-private-airport-transfer',
        renderMode: RenderMode.Prerender,
    },
    {   path: 'de/türkei-24-7-privater-flughafentransfer-blogs/antalya-24-7-private-flughafentransfer',
        renderMode: RenderMode.Prerender,
    },
    {   path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции/24-7-частный-трансфер-аэропорт-анталья',
        renderMode: RenderMode.Prerender,
    },
    {   path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları/antalya-24-7-özel-havalimani-transfer',
        renderMode: RenderMode.Prerender,
    },

    // Alanya Gazipasa Airport Transfer
    {   path: 'en/turkey-24-7-private-airport-transfer-blogs/alanya-gazipasa-24-7-private-airport-transfer',
        renderMode: RenderMode.Prerender,
    },
    {   path: 'de/türkei-24-7-privater-flughafentransfer-blogs/alanya-gazipasa-24-7-private-flughafentransfer',
        renderMode: RenderMode.Prerender,
    },
    // {   path: 'ru/blogs/transfer-aeroport-alanya-gazipasa',
    {   path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции/24-7-частный-трансфер-аэропорт-аланья-газипаша',
        renderMode: RenderMode.Prerender,
    },
    {   path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları/alanya-gazipasa-7-24-özel-havalimani-transfer',
        renderMode: RenderMode.Prerender,
    },

    // istanbul-sabiha-gokcen-airport-transfer
    // Istanbul Sabiha Gokcen Airport Transfer
    {   path: 'en/turkey-24-7-private-airport-transfer-blogs/istanbul-sabiha-gokcen-24-7-private-airport-transfer',
        renderMode: RenderMode.Prerender,
    },
    {   path: 'de/türkei-24-7-privater-flughafentransfer-blogs/istanbul-sabiha-gokcen-24-7-private-flughafentransfer',
        renderMode: RenderMode.Prerender,
    },
    // {   path: 'ru/blogs/transfer-aeroport-stambul-sabiha-gokcen',
    {   path: 'ru/блоги-о-24-7-частном-трансфере-из-аэропорта-в-турции/24-7-частный-трансфер-аэропорт-стамбул-сабиха-гёкчен',
        renderMode: RenderMode.Prerender,
    },
    {   path: 'tr/türkiye-7-24-özel-havalimanı-transfer-blogları/istanbul-sabiha-gokcen-24-7-özel-havalimani-transfer',
        renderMode: RenderMode.Prerender,
    },

    // Prices
    // { path: ':lang/prices',component: PricesComponent, },
    // { path: ':lang/booking',component: BookingComponent, },
    { path: 'en/affordable-prices-for-24-7-private-airport-transfers-in-turkey', 
        renderMode: RenderMode.Prerender,},
    { path: 'de/bezahlbare-preise-für-24-7-privaten-flughafentransfer-in-der-türkei', 
        renderMode: RenderMode.Prerender,},
    { path: 'ru/доступные-цены-на-круглосуточные-частные-трансферы-из-аэропорта-в-турции', 
        renderMode: RenderMode.Prerender,},
    { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferleri-için-uygun-fiyatlar', 
        renderMode: RenderMode.Prerender,},
    
    // Book Now
    { path: 'en/book-now-24-7-private-airport-transfer-in-turkey', 
        renderMode: RenderMode.Prerender,},
    { path: 'de/jetzt-buchen-24-7-privater-flughafentransfer-in-der-türkei', 
        renderMode: RenderMode.Prerender,},
    { path: 'ru/забронировать-сейчас-24-7-частный-трансфер-из-аэропорта-в-турции', 
        renderMode: RenderMode.Prerender,},
    { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-şimdi-rezervasyon-yap', 
        renderMode: RenderMode.Prerender,},

    // Booking received
    {
        path: 'en/book-now-24-7-private-airport-transfer-in-turkey/received', 
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'de/jetzt-buchen-24-7-privater-flughafentransfer-in-der-türkei/received', 
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'ru/забронировать-сейчас-24-7-частный-трансфер-из-аэропорта-в-турции/received', 
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-şimdi-rezervasyon-yap/received', 
        renderMode: RenderMode.Prerender,
    },


    // Simple Landing
    {   path: 'en/quick-and-easy-airport-transfer-booking-in-turkey-step-1', 
        renderMode: RenderMode.Prerender,
    },
    {   path: 'de/schnelle-und-einfache-buchung-von-flughafentransfers-in-der-türkei-schritt-1', 
        renderMode: RenderMode.Prerender,
    },
    {   path: 'ru/быстрое-и-простое-бронирование-трансфера-в-аэропорт-в-турции-шаг-1', 
        renderMode: RenderMode.Prerender,
    },
    {   path: 'tr/türkiye-de-hızlı-ve-kolay-havalimanı-transferi-rezervasyonu-adım-1', 
        renderMode: RenderMode.Prerender,
    },

    {   path: 'en/quick-and-easy-airport-transfer-booking-in-turkey-step-2', 
        renderMode: RenderMode.Prerender,
    },
    {   path: 'de/schnelle-und-einfache-buchung-von-flughafentransfers-in-der-türkei-schritt-2', 
        renderMode: RenderMode.Prerender,
    },
    {   path: 'ru/быстрое-и-простое-бронирование-трансфера-в-аэропорт-в-турции-шаг-2', 
        renderMode: RenderMode.Prerender,
    },
    {   path: 'tr/türkiye-de-hızlı-ve-kolay-havalimanı-transferi-rezervasyonu-adım-2', 
        renderMode: RenderMode.Prerender,
    },

    {   path: 'en/quick-and-easy-airport-transfer-booking-in-turkey-step-3', 
        renderMode: RenderMode.Prerender,
    },
    {   path: 'de/schnelle-und-einfache-buchung-von-flughafentransfers-in-der-türkei-schritt-3', 
        renderMode: RenderMode.Prerender,
    },
    {   path: 'ru/быстрое-и-простое-бронирование-трансфера-в-аэропорт-в-турции-шаг-3', 
        renderMode: RenderMode.Prerender,
    },
    {   path: 'tr/türkiye-de-hızlı-ve-kolay-havalimanı-transferi-rezervasyonu-adım-3', 
        renderMode: RenderMode.Prerender,
    },
    
    // PRIVACY POLICY AND TERMS OF SERVICE
    {
        path: 'en/privacy-policy-for-24-7-private-airport-private-car-transfer-in-turkey',
        renderMode: RenderMode.Prerender,
    }, 
    {
        path: 'de/datenschutz-bestimmungen-für-24-7-privaten-flughafen-privatwagen-transfer-in-der-türkei',
        renderMode: RenderMode.Prerender,
    }, 
    {
        path: 'ru/политика-конфиденциальности-для-24-7-частного-трансфера-частного-автомобиля-из-аэропорта-в-турции',
        renderMode: RenderMode.Prerender,
    }, 
    {
        path: 'tr/türkiye-de-7-24-havalimanı-özel-araba-transferi-için-gizlilik-politikası',
        renderMode: RenderMode.Prerender,
    }, 
    {
        path: 'en/terms-of-service-for-24-7-private-airport-private-car-transfer-in-turkey',
        renderMode: RenderMode.Prerender,
    }, 
    {
        path: 'de/nutzungsbedingungen-für-24-7-privaten-flughafen-privatwagen-transfer-in-der-türkei',
        renderMode: RenderMode.Prerender,
    }, 
    {
        path: 'ru/условия-обслуживания-для-24-7-частного-трансфера-частного-автомобиля-из-аэропорта-в-турции',
        renderMode: RenderMode.Prerender,
    }, 
    {
        path: 'tr/türkiye-de-7-24-havalimanı-özel-araba-transferi-için-hizmet-şartları',
        renderMode: RenderMode.Prerender,
    },


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

    
        {   path: 'en', 
            renderMode: RenderMode.Prerender, },
        {   path: 'de', 
            renderMode: RenderMode.Prerender,},
        {   path: 'ru',
            renderMode: RenderMode.Prerender,},
        {   path: 'tr',    
            renderMode: RenderMode.Prerender,},
    {
        path: 'blogs', 
        renderMode: RenderMode.Prerender, 
    },

    {   path: '', 
        renderMode: RenderMode.Prerender,
    },
    {
        path: '**',
        renderMode: RenderMode.Client,
    }, 





    // {
    //     path: 'en/turkey-airport-transfer-blogs/:slug',
    //     renderMode: RenderMode.Client
    //   },
    //   {
    //     path: 'de/turkei-flughafentransfer-blogs/:slug',
    //     renderMode: RenderMode.Client
    //   },
    //   {
    //     path: 'ru/трансфер-аэропорт-турция-блог/:slug',
    //     renderMode: RenderMode.Client
    //   },
    //   {
    //     path: 'tr/turkiye-havalimani-transfer-bloglari/:slug',
    //     renderMode: RenderMode.Client
    //   },
      
];