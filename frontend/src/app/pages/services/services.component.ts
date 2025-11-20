import { Component, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';
import { Language } from '../../models/language.model';

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
  navbarMenu = NAVBAR_MENU;
  currentLanguage: Language = { ...SUPPORTED_LANGUAGES[0]! };

  constructor(
    private route: ActivatedRoute, 
    private title: Title, 
    private meta: Meta, 
  ) {
  }

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
        title: '24/7 Private Transfers Antalya, Istanbul, Alanya',
        description: 'Affordable 24/7 private airport transfers in Antalya, Istanbul, and Alanya. Book now for reliable services in Turkey.',
      },
      de: {
        title: "Beste 24/7 private Flughafentransfers in der Türkei | Antalya, Istanbul & mehr",
        description: "Erschwingliche und zuverlässige 24/7 private Flughafentransfers in der Türkei. Abdeckung von Antalya, Istanbul, Alanya, Izmir und mehr. Buchen Sie jetzt für eine reibungslose Reise!"
      },
      ru: {
        title: "Лучшие 24/7 частные трансферы из аэропорта в Турции | Анталия, Стамбул и другие",
        description: "Доступные и надежные 24/7 частные трансферы из аэропорта в Турции. Охватываем Анталию, Стамбул, Аланью, Измир и другие города. Забронируйте сейчас для комфортного путешествия!"
      },
      tr: {
        title: "Türkiye'deki En İyi 7/24 Özel Havalimanı Transfer Hizmetleri | Antalya, İstanbul ve Daha Fazlası",
        description: "Türkiye'de uygun fiyatlı ve güvenilir 7/24 özel havalimanı transfer hizmetleri. Antalya, İstanbul, Alanya, İzmir ve daha fazlasını kapsıyor. Sorunsuz bir yolculuk için hemen rezervasyon yapın!"
      }
    };

    const fallbackCode = SUPPORTED_LANGUAGES[0]!.code;
    const meta: any = metaTags[langCode] || metaTags[fallbackCode];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
  
}
