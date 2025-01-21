import { Component } from '@angular/core';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { NAVBAR_MENU } from '../../../constants/navbar-menu.constants';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-alanya-gazipasa-airport-transfer',
    imports: [
      SuperHeaderComponent, 
      NavbarComponent, 
      FooterComponent, 
    ],
  templateUrl: './alanya-gazipasa-airport-transfer.component.html',
  styleUrl: './alanya-gazipasa-airport-transfer.component.scss'
})
export class AlanyaGazipasaAirportTransferComponent {
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
        title: 'Alanya Gazipasa Airport Transfer Guide',
        description: 'How to go from Gazipasa Airport to Alanya? Affordable and reliable airport transfers for a seamless journey.',
      },
      de: {
        title: 'Alanya Gazipasa Flughafentransfer-Leitfaden',
        description: 'Wie komme ich vom Gazipasa Flughafen nach Alanya? Günstige und zuverlässige Flughafentransfers für eine reibungslose Reise.',
      },
      ru: {
        title: 'Гид по трансферам из аэропорта Газипаша в Аланью',
        description: 'Как добраться из аэропорта Газипаша в Аланью? Доступные и надежные трансферы для комфортного путешествия.',
      },
      tr: {
        title: 'Alanya Gazipaşa Havalimanı Transfer Rehberi',
        description: 'Gazipaşa Havalimanı’ndan Alanya’ya nasıl gidilir? Uygun ve güvenilir havalimanı transferleri için keşfedin.',
      },
    };
    
    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }

}
