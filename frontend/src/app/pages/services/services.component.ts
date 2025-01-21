import { Component, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-services',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  currentLanguage: any = {
    code: 'en', 
    name: 'English',
    flag: 'flags/gb.svg',
  };

  constructor(
    private route: ActivatedRoute, 
    private title: Title, 
    private meta: Meta, 
  ) {
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
    this.setMetaTags(this.currentLanguage.code);
  }
  
  setMetaTags(langCode: string): void {
    const metaTags: any = {
      en: {
        title: 'Private Transfers Antalya, Istanbul, Alanya',
        description: 'Affordable private airport transfers in Antalya, Istanbul, and Alanya. Book now for reliable services in Turkey.',
      },
      de: {
        title: 'Privattransfers Antalya, Istanbul, Alanya',
        description: 'Günstige private Flughafentransfers in Antalya, Istanbul und Alanya. Jetzt buchen für zuverlässige Dienste in der Türkei.',
      },
      ru: {
        title: 'Частные трансферы Анталия, Стамбул, Аланья',
        description: 'Доступные частные трансферы из аэропорта в Анталии, Стамбуле и Аланье. Забронируйте сейчас для надежных услуг в Турции.',
      },
      tr: {
        title: 'Özel Transfer Antalya, İstanbul, Alanya',
        description: 'Antalya, İstanbul ve Alanya’da uygun özel havalimanı transferleri. Güvenilir hizmetler için şimdi rezervasyon yapın.',
      },
    };

    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
  
}
