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
      title: 'About 24/7 Private Airport Transfer Services in Turkey | Antalya, Istanbul & More',
      description: 'Learn about affordable and reliable 24/7 private airport transfer services in Turkey. Covering Antalya, Istanbul, Alanya, and more. How to go with ease!',
    },
    de: {
    title: "Über 24/7 private Flughafentransfers in der Türkei | Antalya, Istanbul & mehr",
    description: "Erfahren Sie mehr über günstige und zuverlässige 24/7 private Flughafentransfers in der Türkei. Abdeckung von Antalya, Istanbul, Alanya und mehr. Reisen Sie stressfrei!"
    },
    ru: {
      title: "О круглосуточных частных трансферах из аэропорта в Турции | Анталия, Стамбул и другие",
      description: "Узнайте больше о доступных и надежных круглосуточных частных трансферах из аэропорта в Турции. Охватывает Анталию, Стамбул, Аланью и другие города. Путешествуйте с комфортом!"
    },
    tr: {
      title: "Türkiye'de 7/24 Özel Havalimanı Transfer Hizmetleri Hakkında | Antalya, İstanbul ve Daha Fazlası",
      description: "Türkiye'de uygun fiyatlı ve güvenilir 7/24 özel havalimanı transfer hizmetleri hakkında bilgi edinin. Antalya, İstanbul, Alanya ve daha fazlasını kapsıyor. Kolayca ulaşım sağlayın!"
    }
  };
  const meta: any = metaTags[langCode] || metaTags['en'];
  this.title.setTitle(meta.title);
  this.meta.updateTag({ name: 'description', content: meta.description });
}


}
