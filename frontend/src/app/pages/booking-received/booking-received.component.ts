import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-booking-received',
  imports: [
    SuperHeaderComponent, 
    NavbarComponent, 
    FooterComponent, 
  ],
  templateUrl: './booking-received.component.html',
  styleUrl: './booking-received.component.scss'
})
export class BookingReceivedComponent implements OnInit {
  navBarMenu: any = NAVBAR_MENU;
  currentLanguage = { code: 'en', name: 'English', flag: 'flags/gb.svg' };
    
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
        title: '24/7 Private Airport Transfer Completed',
        description: 'Affordable 24/7 Private transfers from Istanbul Sabiha Gökçen Airport. Reliable transportation to your destination.',
      },
      de: {
        title: "24/7 Privater Flughafentransfer abgeschlossen",
        description: "Erschwingliche 24/7 private Transfers vom Flughafen Istanbul Sabiha Gökçen. Zuverlässiger Transport zu Ihrem Ziel."
      },
      ru: {
        title: "24/7 Частный трансфер из аэропорта завершен",
        description: "Доступные 24/7 частные трансферы из аэропорта Стамбула Сабиха Гёкчен. Надежный транспорт до вашего места назначения."
      },
      tr: {
        title: "7/24 Özel Havalimanı Transferi Tamamlandı",
        description: "İstanbul Sabiha Gökçen Havalimanı'ndan uygun fiyatlı 7/24 özel transferler. Hedefinize güvenilir ulaşım."
      }
    };
    
    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }

}