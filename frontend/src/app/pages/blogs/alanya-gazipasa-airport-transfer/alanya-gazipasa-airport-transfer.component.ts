import { Component } from '@angular/core';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { NAVBAR_MENU } from '../../../constants/navbar-menu.constants';
import { Meta, Title } from '@angular/platform-browser';
import { SUPPORTED_LANGUAGES } from '../../../constants/language.contants';
import { Language } from '../../../models/language.model';

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

  currentLanguage: Language = { ...SUPPORTED_LANGUAGES[0]! };
  
  constructor(
    private route: ActivatedRoute, 
    private title: Title, 
    private meta: Meta, 
  ) {}

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] as string | undefined;
    const resolved =
      SUPPORTED_LANGUAGES.find(({ code }) => code === languageCode) ?? SUPPORTED_LANGUAGES[0]!;
    this.currentLanguage = { ...resolved };
    this.setMetaTags(this.currentLanguage.code);
  }

  setMetaTags(langCode: string): void {
    const metaTags: any = {
      en: {
        title: 'Alanya Gazipasa 24/7 Private Airport Transfer Guide',
        description: 'How to go from Gazipasa Airport to Alanya? Affordable and reliable 24/7 private airport transfers for a seamless journey.',
      },
      de: {
    title: "Alanya Gazipaşa 24/7 Privater Flughafentransfer-Leitfaden",
    description: "Wie kommt man vom Flughafen Gazipaşa nach Alanya? Günstige und zuverlässige 24/7 private Flughafentransfers für eine reibungslose Reise."
      },
      ru: {
        title: "Гид по круглосуточным частным трансферам из аэропорта Газипаша в Аланью",
        description: "Как добраться из аэропорта Газипаша в Аланию? Доступные и надежные круглосуточные частные трансферы из аэропорта для комфортного путешествия."
      },
      tr: {
        title: "Alanya Gazipaşa 7/24 Özel Havalimanı Transfer Rehberi",
        description: "Gazipaşa Havalimanı'ndan Alanya'ya nasıl gidilir? Kesintisiz bir yolculuk için uygun fiyatlı ve güvenilir 7/24 özel havalimanı transferleri."
      }
    };
    
    const fallbackCode = SUPPORTED_LANGUAGES[0]!.code;
    const meta: any = metaTags[langCode] || metaTags[fallbackCode];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }

}
