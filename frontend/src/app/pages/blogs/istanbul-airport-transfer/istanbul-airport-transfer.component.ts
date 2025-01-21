import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { NAVBAR_MENU } from '../../../constants/navbar-menu.constants';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-istanbul-airport-transfer',
    imports: [
      SuperHeaderComponent, 
      NavbarComponent, 
      FooterComponent, 
    ],
  templateUrl: './istanbul-airport-transfer.component.html',
  styleUrl: './istanbul-airport-transfer.component.scss'
})
export class IstanbulAirportTransferComponent  {
  navBarMenu: any = NAVBAR_MENU;
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
    console.log('inside istanbul sabiha gokcen blog')
    console.log(this.route.snapshot)
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
    this.setMetaTags(this.currentLanguage.code);
  }

  setMetaTags(langCode: string): void {
    const metaTags: any = {
      en: {
        title: 'Istanbul Sabiha Gökçen Airport Transfer',
        description: 'Affordable transfers from Istanbul Sabiha Gökçen Airport. Reliable transportation to your destination.',
      },
      de: {
        title: 'Flughafentransfer Istanbul Sabiha Gökçen',
        description: 'Günstige Transfers vom Flughafen Istanbul Sabiha Gökçen. Zuverlässiger Transport zu Ihrem Ziel.',
      },
      ru: {
        title: 'Трансфер из аэропорта Стамбула Сабиха Гёкчен',
        description: 'Доступные трансферы из аэропорта Стамбул Сабиха Гёкчен. Надежная доставка до вашего пункта назначения.',
      },
      tr: {
        title: 'İstanbul Sabiha Gökçen Havalimanı Transferi',
        description: 'İstanbul Sabiha Gökçen Havalimanı’ndan uygun ve güvenilir transferler.',
      },
    };
    
    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }

}