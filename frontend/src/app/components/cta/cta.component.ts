import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';

@Component({
  selector: 'app-cta',
  imports: [
    CommonModule, 
  ],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss'
})
export class CtaComponent implements OnInit {
  navbarMenu = NAVBAR_MENU;
  currentLanguage: any = { code: 'en', name: 'English', flag: 'flags/gb.svg' };

  constructor(
    private route: ActivatedRoute, 
  ) {}

  ngOnInit(): void {
      const languageCode = this.route.snapshot.data['language'] || 'en';
      this.currentLanguage.code = languageCode;
  }


  getTranslation(key: string): string {
    if (typeof key !== 'string') {
      console.error('Translation key is not a string:', key);
      return '';
    }
  
    const keys = key.split('.');
    let value = this.translations;
    for (const k of keys) {
      value = value[k];
      if (!value) return key; // Return key if translation not found
    }
    return value[this.currentLanguage.code] || key;
  }

  translations: any = {
    cta: {
      title: {
        en: 'Travel Hassle-Free with Our Premium Airport Transfer Services in Turkey',
        de: 'Reisen Sie stressfrei mit unseren Premium-Flughafentransferservices in der Türkei',
        ru: 'Путешествуйте без стресса с нашими премиальными услугами трансфера из аэропорта в Турции',
        tr: 'Türkiye\'de Premium Havalimanı Transfer Hizmetlerimiz ile Stresiz Seyahat Edin'
      }, 
      description: {
        en: 'Reliable, comfortable, and on-time transfers from Turkey\'s major airports to your destination. Book now and enjoy a stress-free travel experience.', 
        de: 'Zuverlässige, komfortable und pünktliche Transfers von den wichtigsten Flughäfen der Türkei zu Ihrem Zielort. Buchen Sie jetzt und genießen Sie eine stressfreie Reiseerfahrung.',
        ru: 'Надежные, комфортабельные и своевременные трансферы из крупнейших аэропортов Турции в ваш пункт назначения. Забронируйте сейчас и наслаждайтесь беззаботным путешествием.',
        tr: 'Türkiye\'nin önde gelen havalimanlarından varış noktanıza güvenilir, konforlu ve zamanında transferler. Şimdi rezervasyon yapın ve stresiz bir seyahat deneyiminin tadını çıkarın.'
      },
      button: {
        en: 'Book Your Transfer Now',
        de: 'Buchen Sie jetzt Ihren Transfer',
        ru: 'Забронируйте свой трансфер сейчас',
        tr: 'Transferinizi Şimdi Rezerve Edin'
      }
    }, 
    usp: {
      header: {
        en: 'Why Choose Us?',
        de: 'Warum Uns Wählen?',
        ru: 'Почему выбрать нас?',
        tr: 'Neden Bizi Seçmelisiniz?'
      },
      items: [
        // Reliable Service
        {
          image: {
            name: {
              en: 'reliable-airport-transfer-antalya.webp',
              de: 'zuverlaessiger-flughafentransfer-antalya.webp',
              ru: 'надежный-аэропорт-трансфер-анталья.webp',
              tr: 'guvenilir-havalimani-transfer-antalya.webp'
            }, 
            alt: {
              en: 'Reliable Airport Transfer Antalya',
              de: 'Zuverlässiger Flughafentransfer Antalya',
              ru: 'Надежный аэропорт трансфер Анталья',
              tr: 'Güvenilir Havalimanı Transfer Antalya'
            }
          }, 
          title: {
            en: 'Reliable Service',
            de: 'Zuverlässiger Service',
            ru: 'Надежное обслуживание',
            tr: 'Güvenilir Hizmet'
          },
          description: {
            en: 'We provide reliable airport transfer services in Turkey. Our professional drivers will ensure you reach your destination on time.',
            de: 'Wir bieten zuverlässige Flughafentransferservices in der Türkei an. Unsere professionellen Fahrer sorgen dafür, dass Sie pünktlich Ihr Ziel erreichen.',
            ru: 'Мы предоставляем надежные услуги трансфера из аэропорта в Турции. Наши профессиональные водители обеспечат своевременное достижение вашего пункта назначения.',
            tr: 'Türkiye\'de güvenilir havalimanı transfer hizmetleri sunuyoruz. Profesyonel sürücülerimiz, varış noktanıza zamanında ulaşmanızı sağlayacaktır.'
          }
        },

        // Transparent Pricing
        {
          image: {
            name: {
              en: 'comfortable-airport-transfer-istanbul.webp',
              de: 'komfortabler-flughafentransfer-istanbul.webp',
              ru: 'комфортабельный-аэропорт-трансфер-истанбул.webp',
              tr: 'konforlu-havalimani-transfer-istanbul.webp'
            }, 
            alt: {
              en: 'Comfortable Airport Transfer istanbul',
              de: 'Komfortabler Flughafentransfer istanbul',
              ru: 'Комфортабельный аэропорт трансфер истанбул',
              tr: 'Konforlu Havalimanı Transfer istanbul'
            }
          }, 
          title: {
            en: 'Transparent Pricing',
            de: 'Transparente Preisgestaltung',
            ru: 'Прозрачная ценовая политика',
            tr: 'Şeffaf Fiyatlandırma'
          },
          description: {
            en: 'No hidden fees, fixed and fair prices for every trip.',
            de: 'Keine versteckten Gebühren, feste und faire Preise für jede Fahrt.',
            ru: 'Нет скрытых платежей, фиксированные и справедливые цены на каждую поездку.',
            tr: 'Her seyahat için gizli ücretler yok, sabit ve adil fiyatlar.'
          }
        },

        // Luxury Vehicles
        {
          image: {
            name: {

              en: 'luxury-airport-transfer-alanya-gazipasa.webp',
              de: 'luxus-flughafentransfer-alanya-gazipasa.webp',
              ru: 'роскошный-аэропорт-трансфер-аланья-газипаша.webp',
              tr: 'lüks-havalimani-transfer-alanya-gazipasa.webp'
            }, 
            alt: {
              en: 'Luxury Airport Transfer Alanya Gazipasa',
              de: 'Luxus Flughafentransfer Alanya Gazipasa',
              ru: 'Роскошный аэропорт трансфер Аланья Газипаша',
              tr: 'Lüks Havalimanı Transfer Alanya Gazipasa'
            }
          },
          title: {
            en: 'Luxury Vehicles',
            de: 'Luxusfahrzeuge',
            ru: 'Роскошные автомобили',
            tr: 'Lüks Araçlar'
          }, 
          description: {
            en: 'Travel in style with our modern and well-maintained fleet.',
            de: 'Reisen Sie stilvoll mit unserer modernen und gepflegten Flotte.',
            ru: 'Путешествуйте с комфортом на нашем современном и ухоженном автопарке.',
            tr: 'Modern ve bakımlı filomuzla şıklık içinde seyahat edin.'
          }
        }, 

        // Professional Drivers
        {
          image: {
            name: {
              en: 'professional-airport-transfer-bodrum-milas.webp',
              de: 'professioneller-flughafentransfer-bodrum-milas.webp',
              ru: 'профессиональный-аэропорт-трансфер-бодрум-милас.webp',
              tr: 'profesyonel-havalimani-transfer-bodrum-milas.webp'
            },
            alt: {
              en: 'Professional Airport Transfer Bodrum Milas',
              de: 'Professioneller Flughafentransfer Bodrum Milas',
              ru: 'Профессиональный аэропорт трансфер Бодрум Милас',
              tr: 'Profesyonel Havalimanı Transfer Bodrum Milas'
            }
          },
          title: {
            en: 'Professional Drivers',
            de: 'Professionelle Fahrer',
            ru: 'Профессиональные водители',
            tr: 'Profesyonel Sürücüler'
          },
          description: {
            en: 'Our experienced drivers will ensure a safe and comfortable journey.',
            de: 'Unsere erfahrenen Fahrer sorgen für eine sichere und komfortable Reise.',
            ru: 'Наши опытные водители обеспечат безопасное и комфортное путешествие.',
            tr: 'Deneyimli sürücülerimiz güvenli ve konforlu bir yolculuk sağlayacaktır.'
          }
        }, 

        // 24/7 Support
        {
          image: {
            name: {
              en: '24-7-airport-transfer-izmir-adnan-menderes.webp', 
              de: '24-7-flughafentransfer-izmir-adnan-menderes.webp',
              ru: '24-7-аэропорт-трансфер-измир-аднан-мендерес.webp',
              tr: '24-7-havalimani-transfer-izmir-adnan-menderes.webp'
            }, 
            alt: {
              en: '24/7 Airport Transfer Izmir Adnan Menderes',
              de: '24/7 Flughafentransfer Izmir Adnan Menderes',
              ru: '24/7 Аэропорт трансфер Измир Аднан Мендерес',
              tr: '24/7 Havalimanı Transfer İzmir Adnan Menderes'
            }
          }, 
          title: {
            en: '24/7 Support',
            de: '24/7 Unterstützung',
            ru: '24/7 Поддержка',
            tr: '24/7 Destek'
          },
          description: {
            en: 'Our customer service team is available around the clock to assist you with any queries.',
            de: 'Unser Kundenserviceteam steht rund um die Uhr zur Verfügung, um Ihnen bei Fragen behilflich zu sein.',
            ru: 'Наша команда обслуживания клиентов доступна круглосуточно, чтобы помочь вам с любыми вопросами.',
            tr: 'Müşteri hizmetleri ekibimiz, herhangi bir sorunuzda size yardımcı olmak için günün her saati mevcuttur.'
          }
        }
      ]
    }
  }

}
