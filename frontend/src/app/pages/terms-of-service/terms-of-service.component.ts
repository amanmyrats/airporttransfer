import { Component, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-terms-of-service',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
  ],
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.scss'
})
export class TermsOfServiceComponent implements OnInit {
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
        title: 'Terms of Service for Airport Private Car Transfers in Turkey',
        description: 'Read our terms of service for airport private car transfers in Turkey. Learn about our policies and conditions for booking with us.',
      },
      de: {
        title: 'Nutzungsbedingungen für Flughafen-Privatwagen-Transfers in der Türkei',
        description: 'Lesen Sie unsere Nutzungsbedingungen für Flughafen-Privatwagen-Transfers in der Türkei. Erfahren Sie mehr über unsere Richtlinien und Bedingungen für die Buchung bei uns.',
      },
      ru: {
        title: 'Условия обслуживания для частных автомобильных трансферов из аэропорта в Турции',
        description: 'Ознакомьтесь с нашими условиями обслуживания для частных автомобильных трансферов из аэропорта в Турции. Узнайте о наших политиках и условиях бронирования у нас.',
      },
      tr: {
        title: 'Türkiye’de Havalimanı Özel Araç Transferleri için Hizmet Şartları',
        description: 'Türkiye’de havalimanı özel araç transferleri için hizmet şartlarımızı okuyun. Bizimle rezervasyon yapma politikalarımız ve koşullarımız hakkında bilgi edinin.',
      },
    };

    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
  
}
