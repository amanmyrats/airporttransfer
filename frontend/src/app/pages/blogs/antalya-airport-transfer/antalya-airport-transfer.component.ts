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
        title: '24/7 Private Antalya Airport Transfer Guide',
        description: 'How to go from Antalya Airport to your destination? Discover affordable and reliable 24/7 private transfers in Antalya.',
      },
      de: {
        title: "24/7 Privater Flughafentransfer-Guide für Antalya",
        description: "Wie kommt man vom Flughafen Antalya zu Ihrem Ziel? Entdecken Sie erschwingliche und zuverlässige 24/7 private Transfers in Antalya."
      },
      ru: {
        title: "Гид по круглосуточным частным трансферам из аэропорта Анталия",
        description: "Как добраться из аэропорта Анталии до вашего места назначения? Откройте для себя доступные и надежные круглосуточные частные трансферы в Анталии."
      },
      tr: {
        title: "7/24 Özel Antalya Havalimanı Transfer Rehberi",
        description: "Antalya Havalimanı'ndan varış noktanıza nasıl gidilir? Antalya'da uygun fiyatlı ve güvenilir 7/24 özel transferleri keşfedin."
      }
    };
    
    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
}
