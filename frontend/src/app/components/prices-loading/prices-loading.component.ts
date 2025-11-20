import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SUPPORTED_MAIN_LOCATIONS } from '../../constants/main-location.constants';
import { ActivatedRoute } from '@angular/router';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';
import { Language } from '../../models/language.model';

@Component({
  selector: 'app-prices-loading',
  imports: [CommonModule],
  templateUrl: './prices-loading.component.html',
  styleUrl: './prices-loading.component.scss'
})
export class PricesLoadingComponent implements OnInit {
  mainLocations: any[] = SUPPORTED_MAIN_LOCATIONS;
  currentLanguage: Language = { ...SUPPORTED_LANGUAGES[0]! };

  constructor(
        private route: ActivatedRoute, 
  ) { }
  
  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] as string | undefined;
    const resolved =
      SUPPORTED_LANGUAGES.find(({ code }) => code === languageCode) ?? SUPPORTED_LANGUAGES[0]!;
    this.currentLanguage = { ...resolved };
  }

  translations: any = {
    pricesLoading: {
      en: 'Loading Airport Prices...',
      de: 'Flughafenpreise werden geladen...',
      ru: 'Загрузка цен на аэропорт...',
      tr: 'Havalimanı Fiyatları Yükleniyor...',
    }
  }
}
