import { Component, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { PriceListComponent } from '../../components/price-list/price-list.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';
import { Language } from '../../models/language.model';

@Component({
  selector: 'app-prices',  
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    PriceListComponent,
    FooterComponent, 
  ],
  templateUrl: './prices.component.html',
  styleUrl: './prices.component.scss'
})
export class PricesComponent implements OnInit {
  currentLanguage: Language = { ...SUPPORTED_LANGUAGES[0]! };

  constructor(
  private route: ActivatedRoute, 
  private title: Title, 
  private meta: Meta, 
  ){
  }
  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] as string | undefined;
    const resolved =
      SUPPORTED_LANGUAGES.find(({ code }) => code === languageCode) ?? SUPPORTED_LANGUAGES[0]!;
    this.currentLanguage = { ...resolved };

    this.setMetaTags(this.currentLanguage.code);
  }


  setMetaTags(langCode: string): void {
    // { path: 'en/affordable-prices-for-24-7-private-airport-transfers-in-turkey', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'en' }   },
    // { path: 'de/bezahlbare-preise-für-24-7-privaten-flughafentransfer-in-der-türkei', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'de' }   },
    // { path: 'ru/доступные-цены-на-круглосуточные-частные-трансферы-из-аэропорта-в-турции', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'ru' }   },
    // { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferleri-için-uygun-fiyatlar', loadComponent: () => import('./pages/prices/prices.component').then(m => m.PricesComponent), data: { language: 'tr' }   },
    
    const metaTags: any = {
      en: {
        title: 'Affordable Prices for 24/7 Private Airport Transfers in Turkey',
        description: 'Discover our competitive prices for private airport transfers in Turkey. Enjoy 24/7 service with no hidden fees. Book now for a seamless travel experience.',
      },
      de: {
        title: 'Erschwingliche Preise für 24/7 Private Flughafen Transfers in der Türkei',
        description: 'Entdecken Sie unsere wettbewerbsfähigen Preise für private Flughafen Transfers in der Türkei. Genießen Sie 24/7 Service ohne versteckte Gebühren. Buchen Sie jetzt für ein nahtloses Reiseerlebnis.',
      },
      ru: {
        title: 'Доступные цены на круглосуточные частные трансферы из аэропорта в Турции',
        description: 'Узнайте о наших конкурентоспособных ценах на частные трансферы из аэропорта в Турции. Наслаждайтесь круглосуточным обслуживанием без скрытых платежей. Забронируйте сейчас для беспрепятственного путешествия.',
      },
      tr: {
        title: 'Türkiye\'de 7/24 Özel Havalimanı Transferleri için Uygun Fiyatlar',
        description: 'Türkiye\'deki özel havalimanı transferleri için rekabetçi fiyatlarımızı keşfedin. Gizli ücret olmadan 7/24 hizmetin tadını çıkarın. Sorunsuz bir seyahat deneyimi için hemen rezervasyon yapın.',
      },
    };

    const fallbackCode = SUPPORTED_LANGUAGES[0]!.code;
    const meta: any = metaTags[langCode] || metaTags[fallbackCode];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
}
