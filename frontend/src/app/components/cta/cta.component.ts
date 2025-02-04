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
        en: '24/7 Private Airport Transfers in Turkey – Hassle-Free & Premium Rides to Antalya, Istanbul, Alanya and more.', 
        de: '24/7 Privat flughafen transfers in der Türkei – Stressfreie und Premium-Fahrten nach Antalya, Istanbul, Alanya und mehr.',
        ru: '24/7 Частные трансферы из аэропорта в Турции – Беззаботные и премиальные поездки в Анталью, Стамбул, Аланию и другие.',
        tr: 'Türkiye\'de 24/7 Özel Havalimanı Transferleri – Antalya, İstanbul, Alanya ve daha fazlasına Sorunsuz ve Premium Sürüşler.'
      }, 
      description: {
        en: 'Enjoy reliable, comfortable, and on-time 24/7 private airport transfers from Turkey’s major airports, including Istanbul, Antalya, and Alanya. Book now for a hassle-free and stress-free ride to your destination!', 
        de: 'Genießen Sie zuverlässige, komfortable und pünktliche 24/7 Privat flughafen transfers von den wichtigsten Flughäfen der Türkei, darunter Istanbul, Antalya und Alanya. Buchen Sie jetzt für eine stressfreie und entspannte Fahrt zu Ihrem Ziel!',
        ru: 'Наслаждайтесь надежными, комфортными и своевременными 24/7 частными трансферами из аэропортов Турции, включая Стамбул, Анталью и Аланию. Бронируйте сейчас для беззаботной и безстрессовой поездки к вашему пункту назначения!',
        tr: 'Türkiye\'nin önde gelen havalimanlarından, İstanbul, Antalya ve Alanya dahil olmak üzere güvenilir, konforlu ve zamanında 24/7 özel havalimanı transferlerinin keyfini çıkarın. Hedefinize stresiz ve sorunsuz bir şekilde ulaşmak için şimdi rezervasyon yapın!'
      },
      button: {
        en: 'Book Your 24/7 Airport Transfer', 
        de: 'Buchen Sie Ihren 24/7 Flughafentransfer',
        ru: 'Забронируйте ваш 24/7 аэропорт трансфер',
        tr: '7/24 Havalimanı Transferinizi Rezerve Edin'
      }
    }, 
    usp: {
      header: {
        en: 'Why Choose Our 24/7 Private Airport Transfers in Turkey?',
        de: 'Warum sollten Sie sich für unsere 24/7 Privat flughafen transfers in der Türkei entscheiden?',
        ru: 'Почему выбирать наши 24/7 частные трансферы из аэропорта в Турции?',
        tr: 'Neden Türkiye\'deki 24/7 Özel Havalimanı Transferlerimizi Seçmelisiniz?'
      },
      items: [
        // Reliable Service
        {
          image: {
            name: {
              en: 'reliable-24-7-private-airport-transfer-antalya.webp',
              de: 'zuverlassiger-24-7-privater-flughafentransfer-antalya.webp',
              ru: 'надежный-24-7-частный-трансфер-из-аэропорта-анталья.webp',
              tr: 'guvenilir-7-24-ozel-havalimani-transfer-antalya.webp'
            }, 
            alt: {
              en: 'Reliable 24/7 Private Airport Transfer Antalya',
              de: 'Zuverlässiger 24/7 Privater Flughafentransfer Antalya',
              ru: 'Надежный 24/7 Частный Трансфер из Аэропорта Анталья',
              tr: 'Güvenilir 7/24 Özel Havalimanı Transfer Antalya'
            }
          }, 
          title: {
            en: 'Reliable Private Airport Transfer Service',
            de: 'Zuverlässiger Privater Flughafentransfer',
            ru: 'Надежный частный трансфер из аэропорта',
            tr: 'Güvenilir Özel Havalimanı Transfer Hizmeti'
          },
          description: {
            en: 'Enjoy dependable and on-time private airport transfers across Turkey, including Istanbul, Antalya, and Alanya. Our professional drivers ensure a smooth journey from the airport to your destination.',
            de: 'Genießen Sie zuverlässige und pünktliche private Flughafentransfers in der Türkei, einschließlich Istanbul, Antalya und Alanya. Unsere professionellen Fahrer sorgen für eine reibungslose Reise vom Flughafen zu Ihrem Ziel.',
            ru: 'Наслаждайтесь надежными и своевременными частными трансферами из аэропорта по всей Турции, включая Стамбул, Анталью и Аланию. Наши профессиональные водители обеспечивают плавное путешествие от аэропорта до вашего пункта назначения.',
            tr: 'İstanbul, Antalya ve Alanya dahil olmak üzere Türkiye genelinde güvenilir ve zamanında özel havalimanı transferlerinin keyfini çıkarın. Profesyonel sürücülerimiz, havalimanından varış noktanıza kadar sorunsuz bir yolculuk sağlar.'
          }
        },

        // Transparent Pricing
        {
          image: {
            name: {
              en: 'comfortable-24-7-private-airport-transfer-istanbul.webp',
              de: 'komfortabler-24-7-privater-flughafentransfer-istanbul.webp',
              ru: 'удобный-24-7-частный-трансфер-из-аэропорта-стамбул.webp',
              tr: 'konforlu-7-24-ozel-havalimani-transfer-istanbul.webp'
            }, 
            alt: {
              en: 'Comfortable 24/7 Private Airport Transfer istanbul',
              de: 'Komfortabler 24/7 Privater Flughafentransfer Istanbul',
              ru: 'Удобный 24/7 Частный Трансфер из Аэропорта Стамбул',
              tr: 'Konforlu 7/24 Özel Havalimanı Transfer İstanbul'
            }
          }, 
          title: {
            en: 'Transparent & Fixed Pricing',
            de: 'Transparente und feste Preise',
            ru: 'Прозрачная и фиксированная цена',
            tr: 'Şeffaf ve Sabit Fiyatlar'
          },
          description: {
            en: 'No hidden fees! We offer clear, fixed pricing for all private airport transfers in Turkey. Get affordable, hassle-free rides with no surprises.',
            de: 'Keine versteckten Gebühren! Wir bieten klare, feste Preise für alle privaten Flughafentransfers in der Türkei. Erhalten Sie erschwingliche, stressfreie Fahrten ohne Überraschungen.',
            ru: 'Нет скрытых платежей! Мы предлагаем четкие, фиксированные цены на все частные трансферы из аэропорта в Турции. Получите доступные, беззаботные поездки без сюрпризов.',
            tr: 'Gizli ücret yok! Türkiye\'deki tüm özel havalimanı transferleri için net, sabit fiyatlar sunuyoruz. Sürpriz olmadan uygun fiyatlı, sorunsuz sürüşler alın.'
          }
        },

        // Luxury Vehicles
        {
          image: {
            name: {

              en: 'luxury-24-7-private-airport-transfer-alanya-gazipasa.webp',
              de: 'luxus-24-7-privater-flughafentransfer-alanya-gazipasa.webp',
              ru: 'роскошный-24-7-частный-трансфер-из-аэропорта-аланья-газипаша.webp',
              tr: 'lüks-7-24-ozel-havalimani-transfer-alanya-gazipasa.webp'
            }, 
            alt: {
              en: 'Luxury 24/7 Private Airport Transfer Alanya Gazipasa',
              de: 'Luxus 24/7 Privater Flughafentransfer Alanya Gazipasa',
              ru: 'Роскошный 24/7 Частный Трансфер из Аэропорта Аланья Газипаша',
              tr: 'Lüks 7/24 Özel Havalimanı Transfer Alanya Gazipasa'
            }
          },
          title: {
            en: 'Luxury & Comfortable Vehicles',
            de: 'Luxusfahrzeuge',
            ru: 'Роскошные и комфортные автомобили',
            tr: 'Lüks ve Konforlu Araçlar'
          }, 
          description: {
            en: 'Travel in style and comfort with our modern, well-maintained fleet of private airport transfer vehicles. Choose from luxury sedans, spacious minivans, and VIP options.', 
            de: 'Reisen Sie mit Stil und Komfort mit unserer modernen, gepflegten Flotte von privaten Flughafentransportfahrzeugen. Wählen Sie zwischen Luxuslimousinen, geräumigen Minivans und VIP-Optionen.',
            ru: 'Путешествуйте с комфортом и стилем с нашим современным, ухоженным парком частных транспортных средств из аэропорта. Выбирайте из роскошных седанов, просторных минивэнов и VIP-вариантов.',
            tr: 'Modern, bakımlı özel havalimanı transfer araç filomuzla stil ve konfor içinde seyahat edin. Lüks sedanlar, geniş minivanlar ve VIP seçenekler arasından seçim yapın.'
          }
        }, 

        // Professional Drivers
        {
          image: {
            name: {
              en: 'professional-24-7-private-airport-transfer-bodrum-milas.webp',
              de: 'professioneller-24-7-privater-flughafentransfer-bodrum-milas.webp',
              ru: 'профессиональный-24-7-частный-трансфер-из-аэропорта-бодрум-милас.webp',
              tr: 'profesyonel-7-24-ozel-havalimani-transfer-bodrum-milas.webp'
            },
            alt: {
              en: 'Professional 24/7 Private Airport Transfer Bodrum Milas',
              de: 'Professioneller 24/7 Privater Flughafentransfer Bodrum Milas',
              ru: 'Профессиональный 24/7 Частный Трансфер из Аэропорта Бодрум Милас',
              tr: 'Profesyonel 7/24 Özel Havalimanı Transfer Bodrum Milas'
            }
          },
          title: {
            en: 'Professional & Experienced Drivers',
            de: 'Professionelle und erfahrene Fahrer',
            ru: 'Профессиональные и опытные водители',
            tr: 'Profesyonel ve Deneyimli Sürücüler'
          },
          description: {
            en: 'Our licensed and highly trained drivers provide a safe, smooth, and comfortable airport transfer experience in Turkey. Relax while we take care of your journey!',
            de: 'Unsere lizenzierten und hochqualifizierten Fahrer bieten ein sicheres, reibungsloses und komfortables Flughafentransfererlebnis in der Türkei. Entspannen Sie sich, während wir uns um Ihre Reise kümmern!',
            ru: 'Наши лицензированные и высококвалифицированные водители обеспечивают безопасный, плавный и комфортный опыт трансфера из аэропорта в Турции. Расслабьтесь, пока мы позаботимся о вашем путешествии!',
            tr: 'Lisanslı ve yüksek eğitimli sürücülerimiz, Türkiye\'de güvenli, sorunsuz ve konforlu bir havalimanı transfer deneyimi sunar. Yolculuğunuzla biz ilgilenirken rahatlayın!'
          }
        }, 

        // 24/7 Support
        {
          image: {
            name: {
              en: '24-7-private-airport-transfer-izmir-adnan-menderes.webp', 
              de: '24-7-privater-flughafentransfer-izmir-adnan-menderes.webp',
              ru: '24-7-частный-трансфер-из-аэропорта-измир-аднан-мендерес.webp',
              tr: '7-24-ozel-havalimani-transfer-izmir-adnan-menderes.webp'
            }, 
            alt: {
              en: '24/7 Private Airport Transfer Izmir Adnan Menderes',
              de: '24/7 Privater Flughafentransfer Izmir Adnan Menderes',
              ru: '24/7 Частный Трансфер из Аэропорта Измир Аднан Мендерес',
              tr: '7/24 Özel Havalimanı Transferi İzmir Adnan Menderes'
            }
          }, 
          title: {
            en: '24/7 Customer Support',
            de: '24/7 Kundensupport',
            ru: 'Круглосуточная 24/7 поддержка клиентов',
            tr: '7/24 Müşteri Desteği'
          },
          description: {
            en: 'Need assistance? Our support team is available 24/7 to help with bookings, last-minute changes, and travel inquiries. Your seamless airport transfer experience is our priority!',
            de: 'Benötigen Sie Hilfe? Unser Support-Team steht Ihnen rund um die Uhr zur Verfügung, um bei Buchungen, kurzfristigen Änderungen und Reiseanfragen zu helfen. Ihr reibungsloses Flughafentransfererlebnis hat für uns oberste Priorität!',
            ru: 'Нужна помощь? Наша служба поддержки доступна круглосуточно для помощи в бронировании, внезапных изменений и запросов о поездке. Ваше бесперебойное аэропортовое трансферное впечатление является нашим приоритетом!',
            tr: 'Yardıma mı ihtiyacınız var? Destek ekibimiz, rezervasyonlar, son dakika değişiklikleri ve seyahat soruları konusunda yardımcı olmak için 7/24 hizmetinizdedir. Sorunsuz havalimanı transfer deneyiminiz bizim önceliğimizdir!'
          }
        }
      ]
    }
  }

}
