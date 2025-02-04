import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { BLOGS } from '../../blog-content';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { Meta, Title } from '@angular/platform-browser';

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
  navbarMenu: any = NAVBAR_MENU;
  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };
  blogItems: any = BLOGS;

  constructor(
    private route: ActivatedRoute, 
    private title: Title, 
    private meta: Meta, 
  ) {}

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
    this.setMetaTags(this.currentLanguage.code);
  }

  setMetaTags(langCode: string): void {
    const metaTags: any = {
      en: {
        title: 'Tips for 24/7 Private Airport Transfers in Turkey',
        description: 'Learn how to go to Antalya, Istanbul, and other Turkish cities with our 24/7 private airport transfer tips.',
      },
      de: {
        title: "Tipps für 24/7 private Flughafentransfers in der Türkei",
        description: "Erfahren Sie, wie Sie mit unseren 24/7 privaten Flughafentransfer-Tipps nach Antalya, Istanbul und andere türkische Städte reisen können."
      },
      ru: {
        title: "Советы по 24/7 частным трансферам из аэропорта в Турции",
        description: "Узнайте, как добраться до Антальи, Стамбула и других городов Турции с помощью наших советов по 24/7 частным трансферам из аэропорта."
      },
      tr: {
        title: "Türkiye'de 7/24 Özel Havalimanı Transferleri İçin İpuçları",
        description: "Antalya, İstanbul ve diğer Türk şehirlerine nasıl gideceğinizi 7/24 özel havalimanı transfer ipuçlarımızla öğrenin."
      }
    };
    
    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
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
      return '';
    }
  }

  getImageName(blog: any, lang: any): string {
    if (blog.image && blog.image.name && blog.image.name[lang.code]!) {
      return blog.image.name[lang.code];
    } else {
      return '24-7-private-airport-transfer-turkey.jpg';
    }
  }

  getImageAlt(blog: any, lang: any): string {
    if (blog.image && blog.image.alt && blog.image.alt[lang.code]!) {
      return blog.image.alt[lang.code];
    } else {
      return '24/7 Private Airport Transfer Turkey';
    }
  }

  getSlug(blog: any, lang: any): string {
    if (blog.slug && blog.slug[lang.code]!) {
      return blog.slug[lang.code];
    } else {
      return ''
    }
  }

  translations: any = {
    blog: {
      title: {
        en: 'Our Blog about 24/7 Private Airport Transfer in Turkey',
        de: 'Unser Blog über 24/7 Private Flughafen transfers in der Türkei',
        tr: 'Türkiye\'de 7/24 Özel Havalimanı Transferi Hakkındaki Blogumuz',
        ru: 'Наш блог о 24/7 частных трансферах из аэропорта в Турции',
      },
      subtitle: {
        en: 'Stay updated with the latest travel tips, 24/7 private airport transfer insights, and guides to make your journey seamless and enjoyable.',
        de: 'Bleiben Sie auf dem Laufenden mit den neuesten Reisetipps, Einblicken in 24/7 private Flughafen transfers und Anleitungen, um Ihre Reise reibungslos und angenehm zu gestalten.',
        ru: 'Будьте в курсе последних советов по путешествиям, идей о 24/7 частных трансферах из аэропорта и руководств, чтобы сделать ваше путешествие гладким и приятным.',
        tr: 'Seyahatinizi sorunsuz ve keyifli hale getirmek için en son seyahat ipuçları, 24/7 özel havalimanı transferi bilgileri ve rehberlerle güncel kalın.',
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
