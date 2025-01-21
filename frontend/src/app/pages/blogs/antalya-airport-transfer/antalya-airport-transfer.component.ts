import { Component } from '@angular/core';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { NAVBAR_MENU } from '../../../constants/navbar-menu.constants';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-antalya-airport-transfer',
  imports: [
    SuperHeaderComponent, 
    NavbarComponent, 
    FooterComponent, 
  ],
  templateUrl: './antalya-airport-transfer.component.html',
  styleUrl: './antalya-airport-transfer.component.scss'
})
export class AntalyaAirportTransferComponent {
  navbarMenu: any = NAVBAR_MENU;
  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };
  
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
        title: 'Antalya Airport Transfer Guide',
        description: 'How to go from Antalya Airport to your destination? Discover affordable and reliable transfers in Antalya.',
      },
      de: {
        title: 'Antalya Flughafentransfer-Leitfaden',
        description: 'Wie komme ich vom Antalya Flughafen zu meinem Ziel? Entdecken Sie günstige und zuverlässige Transfers in Antalya.',
      },
      ru: {
        title: 'Гид по трансферам из аэропорта Анталии',
        description: 'Как добраться из аэропорта Анталии до вашего места назначения? Узнайте о доступных и надежных трансферах в Анталии.',
      },
      tr: {
        title: 'Antalya Havalimanı Transfer Rehberi',
        description: 'Antalya Havalimanı’ndan gideceğiniz yere nasıl ulaşacağınızı öğrenin. Uygun ve güvenilir transferler için keşfedin.',
      },
    };
    
    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
}
