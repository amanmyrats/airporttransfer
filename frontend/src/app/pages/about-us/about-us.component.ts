import { Component } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';

@Component({
  selector: 'app-about-us',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  navbarMenu = NAVBAR_MENU;

  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };
  
  constructor(
      private title: Title, 
      private meta: Meta, 
      private route: ActivatedRoute) {}

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
    this.setMetaTags(this.currentLanguage.code);
  }

setMetaTags(langCode: string): void {
  const metaTags: any = {
    en: {
      title: 'About Airport Transfer Services in Turkey | Antalya, Istanbul & More',
      description: 'Learn about affordable and reliable airport transfer services in Turkey. Covering Antalya, Istanbul, Alanya, and more. How to go with ease!',
    },
    de: {
      title: 'Über Flughafentransfers in der Türkei | Antalya, Istanbul & Mehr',
      description: 'Erfahren Sie mehr über günstige und zuverlässige Flughafentransfers in der Türkei. Antalya, Istanbul, Alanya und mehr! Wie komme ich dorthin?',
    },
    ru: {
      title: 'О трансферах из аэропорта в Турции | Анталия, Стамбул и другие',
      description: 'Узнайте о доступных и надежных трансферах из аэропорта в Турции. Анталия, Стамбул, Аланья и другие. Как добраться легко и удобно!',
    },
    tr: {
      title: 'Türkiye Havalimanı Transfer Hizmetleri Hakkında | Antalya, İstanbul ve Daha Fazlası',
      description: 'Türkiye’deki uygun ve güvenilir havalimanı transfer hizmetleri hakkında bilgi edinin. Antalya, İstanbul, Alanya ve daha fazlasına nasıl gidilir?',
    },
  };
  const meta: any = metaTags[langCode] || metaTags['en'];
  this.title.setTitle(meta.title);
  this.meta.updateTag({ name: 'description', content: meta.description });
}

}
