import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { SOCIAL_ICONS } from '../../constants/social.constants';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  socialIcons = SOCIAL_ICONS;
  navbarMenu = NAVBAR_MENU;
  private languageService!: LanguageService;
  
  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };

  constructor(private route: ActivatedRoute) {
      if (typeof window !== 'undefined') {
        this.languageService = inject(LanguageService);}
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  }

  onLanguageSelect(langCode: any): void {
    this.languageService.setLanguage(langCode, true)
  }

  getTranslation(key: string): string {
    return this.translations[key]?.[this.currentLanguage.code] || key;
  }

  translations: any = {
    home: {
      en: 'Homepage',
      de: 'Startseite',
      ru: 'Главная страница',
      tr: 'Anasayfa',
    }, 
    contactus: {
      en: 'Contact Us',
      de: 'Kontaktiere uns',
      tr: 'Bize Ulaşın',
      ru: 'Свяжитесь с нами',
    },
    quicklinks: {
      en: 'Quick Links',
      de: 'Schnelle Links',
      tr: 'Hızlı Bağlantılar',
      ru: 'Быстрые ссылки',
    },
    followus: {
      en: 'Follow Us',
      de: 'Folge uns',
      tr: 'Bizi takip et',
      ru: 'Следите за нами',
    },
    aboutus: {
      en: 'About Us',
      de: 'Über uns',
      tr: 'Hakkımızda',
      ru: 'О нас',
    },
    ourservices: {
      en: 'Our Services',
      de: 'Unsere Leistungen',
      tr: 'Hizmetlerimiz',
      ru: 'Наши услуги',
    },
    blog: {
      en: 'Blog',
      de: 'Blog',
      tr: 'Blog',
      ru: 'Блог',
    },
    newBlog: {
      en: 'New Blog',
      de: 'Neuer Blog',
      tr: 'Yeni Blog',
      ru: 'Новый блог',
    },
    contact: {
      en: 'Contact',
      de: 'Kontakt',
      tr: 'İletişim',
      ru: 'Контакт',
    },
    gallery: {
      en: 'Gallery',
      de: 'Galerie',
      tr: 'Galeri',
      ru: 'Галерея',
    }, 
    privacyPolicy: {
      en: 'Privacy Policy',
      de: 'Datenschutz-Bestimmungen',
      tr: 'Gizlilik Politikası',
      ru: 'Политика конфиденциальности',
    },
    termsOfService: {
      en: 'Terms of Service',
      de: 'Nutzungsbedingungen',
      tr: 'Hizmet Şartları',
      ru: 'Условия обслуживания',
    },
    allRightsReserved: {
      en: 'All Rights Reserved.',
      de: 'Alle Rechte vorbehalten.',
      tr: 'Tüm Hakları Saklıdır.',
      ru: 'Все права защищены.',
    },
    allLanguages: {
      en: 'Languages',
      de: 'Sprachen',
      tr: 'Diller',
      ru: 'Языки',
    }
  };
}
