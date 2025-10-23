import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SUPPORTED_MAIN_LOCATIONS } from '../../constants/main-location.constants';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-prices-loading',
  imports: [CommonModule],
  templateUrl: './prices-loading.component.html',
  styleUrl: './prices-loading.component.scss'
})
export class PricesLoadingComponent implements OnInit {
  mainLocations: any[] = SUPPORTED_MAIN_LOCATIONS;
  currentLanguage = {code: 'en', name: 'English', flag: 'flags/gb.svg'};

  constructor(
        private route: ActivatedRoute, 
  ) { }
  
  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
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
