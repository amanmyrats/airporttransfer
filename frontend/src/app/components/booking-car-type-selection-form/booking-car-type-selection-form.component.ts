import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, OnInit, output } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { CarType } from '../../models/car-type.model';
import { SUPPORTED_CAR_TYPES } from '../../constants/car-type.constants';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { CurrencyService } from '../../services/currency.service';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { SOCIAL_ICONS } from '../../constants/social.constants';

@Component({
  selector: 'app-booking-car-type-selection-form',
  imports: [
    CommonModule, 
  ],
  templateUrl: './booking-car-type-selection-form.component.html',
  styleUrl: './booking-car-type-selection-form.component.scss'
})
export class BookingCarTypeSelectionFormComponent implements OnInit {
  socialIcons = SOCIAL_ICONS;
  maxDistance: number = 230;

  bookingService = inject(BookingService);
  priceCalculatorService = inject(PriceCalculatorService);
  currencyService = inject(CurrencyService);
  carTypeSelectionOutput = output<any>();


  carTypes: CarType[] = [];

  constructor(
    private route: ActivatedRoute, 
    public languageService: LanguageService,
  ) {
    this.carTypes = SUPPORTED_CAR_TYPES;
  }

  ngOnInit(): void {
    console.log('BookingCarTypeSelectionFormComponent initialized');
    console.log(this.bookingService.bookingCarTypeSelectionForm.value);
    this.bookingService.distance.set(this.bookingService.bookingCarTypeSelectionForm.value.distance);
  }

  onCarTypeSelection(carType: any, price: number, currency_code: string, distance: number): void {
    console.log('Selected CarType:', carType);
    // Handle carType selection logic here
    this.bookingService.bookingCarTypeSelectionForm.patchValue({
      car_type: carType.code,
      amount: price, 
      currency_code: currency_code,
      distance: distance, 
      driving_duration: 60,
    });
    if (this.bookingService.bookingCarTypeSelectionForm.valid) {
      this.carTypeSelectionOutput.emit(this.bookingService.bookingCarTypeSelectionForm.value);
    } else {
      console.log('CarType selection form is invalid');
    }
  }

  // Dynamically calculate prices based on current currency and distance
  calculatedPrices = computed(() =>
    this.carTypes.map((carType) => {
      // const priceInEuros = this.priceCalculatorService.calculatePrice(
      //   this.bookingService.distance(), 
      //   carType.coefficient!, 
      //   this.bookingService.airportCoefficient()!
      // );
      const priceInEuros = this.priceCalculatorService.calculateFixedPrice(
          this.bookingService.distance(), 
          carType, 
          this.bookingService.airportCoefficient()!
        );
      return {
        ...carType,
        price: this.priceCalculatorService.getRoundedPrice(
          priceInEuros, 
          this.currencyService.currentCurrency().code!, 
          this.currencyService.currentCurrency().rate!),
      };
    })
  );

  isValidDistance(): boolean {
    const distance = this.bookingService.distance();
    return typeof distance && distance > 0 && !isNaN(distance);
  }
  
  isLongDistance(): boolean {
    const distance = this.bookingService.distance();
    return typeof distance && distance > this.maxDistance;
  }

  translations: any = {
    cars: {
      en: 'Available Car Types', 
      de: 'Verfügbare Fahrzeugtypen',
      ru: 'Доступные типы автомобилей',
      tr: 'Mevcut Araç Tipleri',
    }, 
    distance: {
      en: 'Distance', 
      de: 'Entfernung',
      ru: 'Расстояние',
      tr: 'Mesafe',
    }, 
    select: {
      en: 'Select', 
      de: 'Auswählen',
      ru: 'Выбрать',
      tr: 'Seç',
    }, 
    price: {
      en: 'Price', 
      de: 'Preis',
      ru: 'Цена',
      tr: 'Fiyat',
    }, 
    contact: {
      en: 'Write to us, we’ll help you find the best option', 
      de: 'Schreiben Sie uns, wir helfen Ihnen, die beste Option zu finden',
      ru: 'Напишите нам, и мы поможем найти лучший вариант',
      tr: 'Bize yazın, size en iyi seçeneği bulalım',
    },
    invalidDistanceMessage: {
      en: 'Please write to us directly, as your distance cannot be calculated.', 
      de: 'Bitte schreiben Sie uns direkt, da Ihre Entfernung nicht berechnet werden kann.',
      ru: 'Пожалуйста, свяжитесь с нами напрямую, так как ваше расстояние не может быть рассчитано.',
      tr: 'Lütfen, mesafeniz hesaplanamadığı için doğrudan bize yazın.',
    },
    specialPrice: {
      en: 'Write to us directly for a special price', 
      de: 'Schreiben Sie uns direkt für einen Sonderpreis',
      ru: 'Напишите нам напрямую для получения специальной цены',
      tr: 'Özel fiyat için bize doğrudan yazın',
    },
    longDistanceMessage: {
      en: 'The distance is too long to calculate a standard rate. Please contact us for an affordable price.', 
      de: 'Die Entfernung ist zu groß, um einen Standardtarif zu berechnen. Bitte kontaktieren Sie uns für einen günstigen Preis.',
      ru: 'Расстояние слишком велико для расчета стандартной ставки. Пожалуйста, свяжитесь с нами, чтобы получить доступную цену.',
      tr: 'Mesafe standart bir ücret hesaplamak için çok uzun. Uygun fiyat için lütfen bizimle iletişime geçin.',
    }, 
  }


}
