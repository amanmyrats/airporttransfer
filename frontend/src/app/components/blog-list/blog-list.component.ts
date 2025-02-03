import { Component, OnInit } from '@angular/core';
import { BLOGS } from '../../blog-content';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';

@Component({
  selector: 'app-blog-list',
  imports: [
    CommonModule, 
  ],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent  implements OnInit {
  navbarMenu = NAVBAR_MENU;
  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };

  blogs: any = BLOGS;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
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

  getTitle(blog: any, lang:any ): string {
    if (blog.title && blog.title[lang.code]) {
      return blog.title[lang.code]
    } else {
      return '24/7 Private Airport Transfer in Turkey';
    }
  }

  getExcerpt(blog: any, lang: any): string {
    if (blog.excerpt && blog.excerpt[lang.code]) {
      return blog.excerpt[lang.code];
    } else {
      return 'Discover how to make your 24/7 private airport transfer in Turkey stress-free and efficient. Learn why choosing the right service is crucial for your travel experience.'
    }
  }

  getSlug(blog: any, lang: any): string {
    if (blog.slug && blog.slug[lang.code]!) {
      return blog.slug[lang.code];
    } else {
      return ''
    }
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
    blog: {
      title: {
        en: 'Blogs About: 24/7 Private Airport Transfers in Turkey, Istanbul, Antalya, Alanya',
        de: 'Blogs Über: 24/7 Private Flughafentransfers in der Türkei, Istanbul, Antalya, Alanya',
        ru: 'Блоги о: 24/7 Частные трансферы из аэропорта в Турции, Стамбуле, Анталии, Аланье',
        tr: 'Türkiye, İstanbul, Antalya, Alanya\'da 7/24 Özel Havalimanı Transferleri Hakkında Bloglar',
      },
    },
  };
  

}
