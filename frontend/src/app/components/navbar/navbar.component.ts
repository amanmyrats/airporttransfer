import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  menuOpen = false;
  currentLanguage = {  code: 'en', 
                    name: 'English', 
                    flag: 'flags/gb.svg', 
                  };

  constructor(
    private route: ActivatedRoute, 
  ) { 
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
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
    home: {
      en: 'Home',
      de: 'Startseite',
      ru: 'Главная',
      tr: 'Anasayfa'
    }, 
    prices: {
      en: 'Prices',
      de: 'Preise',
      ru: 'Цены',
      tr: 'Fiyatlar'
    }, 
    bookNow: {
      en: 'Book Now',
      de: 'Jetzt buchen',
      ru: 'Забронировать сейчас',
      tr: 'Şimdi rezervasyon yap'
    }, 
    blogs: {
      en: 'Blogs',
      de: 'Blogs',
      ru: 'Блоги',
      tr: 'Bloglar'
    },
    contactUs: {
      en: 'Contact Us',
      de: 'Kontaktiere uns',
      ru: 'Связаться с нами',
      tr: 'Bizimle iletişime geçin'
    }, 
    aboutUs: {
      en: 'About Us',
      de: 'Über uns',
      ru: 'О нас',
      tr: 'Hakkımızda'
    },
    services: {
      en: 'Services',
      de: 'Dienstleistungen',
      ru: 'Услуги',
      tr: 'Hizmetler'
    }, 
    gallery: {
      en: 'Gallery',
      de: 'Galerie',
      ru: 'Галерея',
      tr: 'Galeri'
    },
    faq: {
      en: 'FAQ',
      de: 'FAQ',
      ru: 'Часто задаваемые вопросы',
      tr: 'SSS'
    },
    logo: {
      name: {
        en: 'airport-transfer-in-istanbul.webp',
        de: 'flughafen-transfer-in-alanya.webp',
        ru: 'трансфер-из-аэропорта-в-анталии.webp',
        tr: 'istanbul-havalimanı-transferi.webp'
      },
      alt: {
        en: 'Airport Transfer in Istanbul',
        de: 'Flughafen Transfer in Alanya',
        ru: 'Трансфер из аэропорта в Анталии',
        tr: 'İstanbul Havalimanı Transferi'
      }
    }
  };
  
}
