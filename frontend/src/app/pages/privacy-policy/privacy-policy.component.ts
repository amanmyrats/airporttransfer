import { Component, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policy',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent implements OnInit {
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
        title: 'Privacy Policy for Airport Private Car Transfers Antalya, Istanbul, Alanya',
        description: 'Read our privacy policy for airport private car transfers in Antalya, Istanbul, and Alanya. Learn how we protect your data and information.',
      },
      de: {
        title: 'Datenschutzrichtlinie für Flughafen-Privatwagen-Transfers Antalya, Istanbul, Alanya',
        description: 'Lesen Sie unsere Datenschutzrichtlinie für Flughafen-Privatwagen-Transfers in Antalya, Istanbul und Alanya. Erfahren Sie, wie wir Ihre Daten und Informationen schützen.',
      },
      ru: {
        title: 'Политика конфиденциальности для частных автомобильных трансферов из аэропорта Анталия, Стамбул, Аланья',
        description: 'Ознакомьтесь с нашей политикой конфиденциальности для частных автомобильных трансферов из аэропорта в Анталии, Стамбуле и Аланье. Узнайте, как мы защищаем ваши данные и информацию.',
      },
      tr: {
        title: 'Antalya, İstanbul, Alanya Havalimanı Özel Araç Transferleri için Gizlilik Politikası',
        description: 'Antalya, İstanbul ve Alanya havalimanı özel araç transferleri için gizlilik politikamızı okuyun. Verilerinizi ve bilgilerinizi nasıl koruduğumuzu öğrenin.',
      },
    };

    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
  
}
