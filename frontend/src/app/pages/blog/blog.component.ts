import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
    CommonModule, 
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit {
  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };


  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
    console.log(this.translations.blog.blogItems)
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

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, ''); // Remove special characters
  }

  translations: any = {
    blog: {
      title: {
        en: 'Our Blog',
        de: 'Unser Blog',
        tr: 'Blogumuz',
        ru: 'Наш блог',
      },
      subtitle: {
        en: 'Stay updated with the latest travel tips, airport transfer insights, and guides to make your journey seamless and enjoyable.',
        de: 'Bleiben Sie auf dem Laufenden mit den neuesten Reisetipps, Einblicken in Flughafentransfers und Anleitungen für eine reibungslose und angenehme Reise.',
        tr: 'En son seyahat ipuçları, havalimanı transfer bilgileri ve yolculuğunuzu sorunsuz ve keyifli hale getirecek rehberlerle güncel kalın.',
        ru: 'Будьте в курсе последних советов по путешествиям, информации о трансферах из аэропорта и руководств, которые сделают ваше путешествие плавным и приятным.',
      },
      categories: {
        title: {
          en: 'Categories',
          de: 'Kategorien',
          tr: 'Kategoriler',
          ru: 'Категории',
        },
        list: {
          tips: {
            en: 'Travel Tips',
            de: 'Reisetipps',
            tr: 'Seyahat İpuçları',
            ru: 'Советы путешественникам',
          },
          destinations: {
            en: 'Destinations',
            de: 'Reiseziele',
            tr: 'Destinasyonlar',
            ru: 'Направления',
          },
          luxuryTravel: {
            en: 'Luxury Travel',
            de: 'Luxusreisen',
            tr: 'Lüks Seyahat',
            ru: 'Роскошные путешествия',
          },
          familyTravel: {
            en: 'Family Travel',
            de: 'Familienreisen',
            tr: 'Aile Seyahati',
            ru: 'Семейные путешествия',
          },
        },
      },
      blogItems: [
        {
          title: {
            en: 'Top Tips for Airport Transfers',
            de: 'Top-Tipps für Flughafentransfers',
            tr: 'Havalimanı Transferleri İçin En İyi İpuçları',
            ru: 'Лучшие советы по трансферам из аэропорта',
          },
          excerpt: {
            en: 'Discover how to make your airport transfer smooth and stress-free with these expert tips. Learn about the best practices to ensure comfort and reliability.',
            de: 'Entdecken Sie, wie Sie Ihren Flughafentransfer reibungslos und stressfrei gestalten können, mit diesen Expertentipps. Erfahren Sie mehr über die besten Praktiken für Komfort und Zuverlässigkeit.',
            tr: 'Havalimanı transferinizi sorunsuz ve stresiz hale getirmek için bu uzman ipuçlarını keşfedin. Konfor ve güvenilirliği sağlamak için en iyi uygulamaları öğrenin.',
            ru: 'Узнайте, как сделать ваш трансфер из аэропорта плавным и беззаботным с помощью этих экспертных советов. Узнайте о лучших практиках для обеспечения комфорта и надежности.',
          },
        },
        {
          title: {
            en: 'Luxury Airport Transfers in Turkey',
            de: 'Luxus-Flughafentransfers in der Türkei',
            tr: 'Türkiye’de Lüks Havalimanı Transferleri',
            ru: 'Роскошные трансферы из аэропорта в Турции',
          },
          excerpt: {
            en: 'Explore our premium services that redefine luxury travel. From Mercedes Vito to Sprinter vans, indulge in style and comfort on your next journey.',
            de: 'Entdecken Sie unsere Premium-Dienstleistungen, die Luxusreisen neu definieren. Von Mercedes Vito bis hin zu Sprinter-Vans, gönnen Sie sich Stil und Komfort bei Ihrer nächsten Reise.',
            tr: 'Lüks seyahati yeniden tanımlayan premium hizmetlerimizi keşfedin. Mercedes Vito’dan Sprinter minibüslerine kadar, bir sonraki yolculuğunuzda stil ve konforun tadını çıkarın.',
            ru: 'Исследуйте наши премиальные услуги, которые переопределяют роскошные путешествия. От Mercedes Vito до фургонов Sprinter, наслаждайтесь стилем и комфортом в вашем следующем путешествии.',
          },
        },
        {
          title: {
            en: 'Family-Friendly Airport Transfers',
            de: 'Familienfreundliche Flughafentransfers',
            tr: 'Aile Dostu Havalimanı Transferleri',
            ru: 'Семейные трансферы из аэропорта',
          },
          excerpt: {
            en: 'Traveling with family? Learn how our spacious vehicles and child-friendly amenities make family travel effortless and enjoyable.',
            de: 'Reisen Sie mit der Familie? Erfahren Sie, wie unsere geräumigen Fahrzeuge und kinderfreundlichen Annehmlichkeiten das Reisen mit der Familie mühelos und angenehm machen.',
            tr: 'Aile ile seyahat ediyor musunuz? Geniş araçlarımızın ve çocuk dostu olanaklarımızın aile seyahatini nasıl zahmetsiz ve keyifli hale getirdiğini öğrenin.',
            ru: 'Путешествуете с семьей? Узнайте, как наши просторные автомобили и удобства для детей делают семейные поездки легкими и приятными.',
          },
        },
      ],
      pagination: {
        previous: {
          en: 'Previous',
          de: 'Zurück',
          tr: 'Önceki',
          ru: 'Предыдущий',
        },
        next: {
          en: 'Next',
          de: 'Weiter',
          tr: 'Sonraki',
          ru: 'Следующий',
        },
      },
      readMore: {
        en: 'Read More',
        de: 'Weiterlesen',
        tr: 'Devamını Oku',
        ru: 'Читать далее',
      },
    },
  };
  
}
