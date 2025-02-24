export const SUPPORTED_CAR_TYPES = [
    { 
        code: 'VITO', 
        name: 'Mercedes Vito', 
        pax: '1-6', 
        specialPrice: false,
        image: {
            name: {
                en: 'vito-24-7-private-airport-transfer-turkey.webp', 
                de: 'vito-24-7-private-flughafentransfer-turkei.webp',
                ru: 'vito-24-7-частный-трансфер-из-аэропорта-турция.webp',
                tr: 'vito-7-24-ozel-havalimani-transferi-türkiye.webp'
            }, 
            alt: {
                en: 'Mercedes Vito 24/7 Private Airport Transfer Turkey', 
                de: 'Mercedes Vito 24/7 Privater Flughafentransfer Türkei',
                ru: 'Mercedes Vito 24/7 Частный Трансфер из Аэропорта Турция',
                tr: 'Mercedes Vito 7/24 Özel Havalimanı Transferi Türkiye'
            }
        },
        price: 0,
        coefficient: 1
    },
    { 
        code: 'SPRINTER', 
        name: 'Mercedes Sprinter', 
        pax: '1-15', 
        specialPrice: false,
        image: {
            name: {
                en: 'sprinter-24-7-private-airport-transfer-istanbul.webp', 
                de: 'sprinter-24-7-private-flughafentransfer-istanbul.webp',
                ru: 'sprinter-24-7-частный-трансфер-из-аэропорта-стамбул.webp',
                tr: 'sprinter-7-24-ozel-havalimani-transferi-istanbul.webp'
            }, 
            alt: {
                en: 'Mercedes Sprinter 24/7 Private Airport Transfer Istanbul', 
                de: 'Mercedes Sprinter 24/7 Privater Flughafentransfer Istanbul',
                ru: 'Mercedes Sprinter 24/7 Частный Трансфер из Аэропорта Стамбул',
                tr: 'Mercedes Sprinter 7/24 Özel Havalimanı Transferi Istanbul'
            }
        },
        price: 0,
        coefficient: 1.1
    },
    { 
        code: 'MAYBACH', 
        name: 'Mercedes Maybach S class', 
        pax: '1-2', 
        specialPrice: true,
        image: {
            name: {
                en: 'maybach-s-class-24-7-private-airport-transfer-antalya.webp', 
                de: 'maybach-s-class-24-7-private-flughafentransfer-antalya.webp',
                ru: 'maybach-s-class-24-7-частный-трансфер-из-аэропорта-анталья.webp',
                tr: 'maybach-s-class-7-24-ozel-havalimani-transferi-antalya.webp'
            }, 
            alt: {
                en: 'Mercedes Maybach S class 24/7 Private Airport Transfer Antalya',
                de: 'Mercedes Maybach S class 24/7 Privater Flughafentransfer Antalya',
                ru: 'Mercedes Maybach S class 24/7 Частный Трансфер из Аэропорта Анталья',
                tr: 'Mercedes Maybach S class 7/24 Özel Havalimanı Transferi Antalya'
            }
        },
        price: 0,
        coefficient: 1.8
    },
    { 
        code: 'MINIBUS', 
        name: 'Minibus', 
        pax: '1-28', 
        specialPrice: true,
        image: {
            name: {
                en: 'minibus-24-7-private-airport-transfer-alanya-gazipasa.webp', 
                de: 'minibus-24-7-private-flughafentransfer-alanya-gazipasa.webp',
                ru: 'minibus-24-7-частный-трансфер-из-аэропорта-аланья-газипаша.webp',
                tr: 'minibus-7-24-ozel-havalimani-transferi-alanya-gazipasa.webp'
            }, 
            alt: {
                en: 'Minibus 24/7 Private Airport Transfer Alanya Gazipasa', 
                de: 'Minibus 24/7 Privater Flughafentransfer Alanya Gazipasa',
                ru: 'Minibus 24/7 Частный Трансфер из Аэропорта Аланья Газипаша',
                tr: 'Minibus 7/24 Özel Havalimanı Transferi Alanya Gazipasa'
            }
        },
        price: 0,
        coefficient: 0.7
    },
];
