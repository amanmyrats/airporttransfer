import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { BLOGS } from '../../blog-content';

@Component({
  selector: 'app-blogs',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
    CommonModule, 
  ],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class BlogsComponent implements OnInit {
  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };
  blogItems: any = BLOGS;



  constructor(private route: ActivatedRoute) {}

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

  generateSlug(blog: any, lang: any): string {
    if (blog.slug && blog.slug[lang.code]!) {
      return blog.slug[lang.code];
    } else if (blog.title && blog.title[lang.code]!) {
      return blog.title[lang.code]!
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, ''); // Remove special characters
    } else {
      return 'anyblog';
    }
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
      // categories: {
      //   title: {
      //     en: 'Categories',
      //     de: 'Kategorien',
      //     tr: 'Kategoriler',
      //     ru: 'Категории',
      //   },
      //   list: {
      //     tips: {
      //       en: 'Travel Tips',
      //       de: 'Reisetipps',
      //       tr: 'Seyahat İpuçları',
      //       ru: 'Советы путешественникам',
      //     },
      //     destinations: {
      //       en: 'Destinations',
      //       de: 'Reiseziele',
      //       tr: 'Destinasyonlar',
      //       ru: 'Направления',
      //     },
      //     luxuryTravel: {
      //       en: 'Luxury Travel',
      //       de: 'Luxusreisen',
      //       tr: 'Lüks Seyahat',
      //       ru: 'Роскошные путешествия',
      //     },
      //     familyTravel: {
      //       en: 'Family Travel',
      //       de: 'Familienreisen',
      //       tr: 'Aile Seyahati',
      //       ru: 'Семейные путешествия',
      //     },
      //   },
      // },
      // pagination: {
      //   previous: {
      //     en: 'Previous',
      //     de: 'Zurück',
      //     tr: 'Önceki',
      //     ru: 'Предыдущий',
      //   },
      //   next: {
      //     en: 'Next',
      //     de: 'Weiter',
      //     tr: 'Sonraki',
      //     ru: 'Следующий',
      //   },
      // },
      readMore: {
        en: 'Read More',
        de: 'Weiterlesen',
        tr: 'Devamını Oku',
        ru: 'Читать далее',
      },
    },
  };
  
}
