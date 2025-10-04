import { CommonModule } from '@angular/common';
import { Component, effect, inject, Input, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { GmapsAutocompleteDirective } from '../../directives/gmaps-autocomplete.directive';
import { GoogleMapsService } from '../../services/google-maps.service';
import { LanguageService } from '../../services/language.service';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { SOCIAL_ICONS } from '../../constants/social.constants';
// import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { PriceListComponent } from '../price-list/price-list.component';

@Component({
  selector: 'app-booking-initial-form',
  imports: [
    CommonModule, 
    FormsModule, ReactiveFormsModule, 
    GmapsAutocompleteDirective, 
    PriceListComponent, 
  ],
  templateUrl: './booking-initial-form.component.html',
  styleUrl: './booking-initial-form.component.scss'
})
export class BookingInitialFormComponent implements OnInit {
  @Input() langInput: any | null = null;
  
  socialIcon = SOCIAL_ICONS;
  bookingService = inject(BookingService);
  priceCalculatorService = inject(PriceCalculatorService);
  searchVehicle = output<any>();

  hasSubmitted = false;

  constructor(
    private fb: FormBuilder, 
    private googleMapsService: GoogleMapsService, 
    public languageService: LanguageService, 
  ) {
  }

  ngOnInit(): void {
    this.toggleReturnTrip(); // Ensure return fields are updated on initialization
  }

  toggleReturnTrip(): void {
    const returnDateControl = this.bookingService.bookingInitialForm.get('returnDate');
    const returnTimeControl = this.bookingService.bookingInitialForm.get('returnTime');
    const isReturnTrip = this.bookingService.bookingInitialForm.get('returnTrip')?.value;

    if (isReturnTrip) {
      returnDateControl?.setValidators(Validators.required);
      returnTimeControl?.setValidators(Validators.required);
    } else {
      returnDateControl?.clearValidators();
      returnTimeControl?.clearValidators();
    }

    returnDateControl?.updateValueAndValidity();
    returnTimeControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.hasSubmitted = true;
    console.log('Booking Form:', this.bookingService.bookingInitialForm.value);
    const pickupLat: number = this.bookingService.bookingInitialForm.get('pickup_lat')?.value;
    const pickupLng: number = this.bookingService.bookingInitialForm.get('pickup_lng')?.value;
    const destLat: number = this.bookingService.bookingInitialForm.get('dest_lat')?.value;
    const destLng: number = this.bookingService.bookingInitialForm.get('dest_lng')?.value;
  
    const origin: google.maps.LatLngLiteral = { lat: pickupLat, lng: pickupLng };
    const destination: google.maps.LatLngLiteral = { lat: destLat, lng: destLng };

    const airportCoefficientPickUp = this.priceCalculatorService.getAirportCoefficient(pickupLat, pickupLng);
    const airportCoefficientDest = this.priceCalculatorService.getAirportCoefficient(destLat, destLng);

    console.log('Coefficients:', airportCoefficientPickUp, airportCoefficientDest);
    // Assign bigger airport coefficient to booking form
    this.bookingService.bookingInitialForm.get('airport_coefficient')!.setValue(
      Math.max(airportCoefficientPickUp, airportCoefficientDest)
    );
    this.bookingService.airportCoefficient.set(
      Math.max(airportCoefficientPickUp, airportCoefficientDest)
    );
    
    this.googleMapsService.calculateDrivingDistanceAndTime(origin, destination
    ).then(result => {
      this.bookingService.distance.set(result.distance);
      this.bookingService.drivingDuration.set(result.duration);
      this.bookingService.bookingCarTypeSelectionForm.get('distance')!.setValue(
        result.distance);
      this.bookingService.bookingCarTypeSelectionForm.get('driving_duration')!.setValue(
        result.duration);
    }).catch(error => {
      console.error('Error calculating distance:', error);
    });

    if (this.bookingService.bookingInitialForm.valid) {
      console.log('Booking Details:', this.bookingService.bookingInitialForm.value);
      // Handle booking submission logic here

      this.searchVehicle.emit(this.bookingService.bookingInitialForm.value);
    } else {
      console.log('bookingInitialForm is invalid');
    }

    // Send event to GTM
    // this.gtmService.pushTag({
    //   event: 'view_item',
    //   category: 'Booking',
    //   action: 'Click',
    //   label: 'View Item'
    // });
  }

  onPickupPlaceChanged(place: google.maps.places.PlaceResult): void {
    console.log('Pickup place selected:', place);
    const pickup_full = this.googleMapsService.getFormattedAddress(place);
    const pickup_lat = this.googleMapsService.getLatitude(place);
    const pickup_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      pickup_full: pickup_full, pickup_lat: pickup_lat, pickup_lng: pickup_lng
    });
  }

  onDestPlaceChanged(place: google.maps.places.PlaceResult): void {
    console.log('Destination place selected:', place);
    const dest_full = this.googleMapsService.getFormattedAddress(place);
    const dest_lat = this.googleMapsService.getLatitude(place);
    const dest_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      dest_full: dest_full, dest_lat: dest_lat, dest_lng: dest_lng
    });
  }

  preventFormSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the form from submitting
    }
  }
  
  clearField(controlName: string): void {
    this.bookingService.bookingInitialForm.get(controlName)?.setValue('');
  }

  swapLocations(): void {
    const form = this.bookingService.bookingInitialForm;
    const pairs: [string, string][] = [
      ['pickup_place', 'dest_place'],
      ['pickup_full', 'dest_full'],
      ['pickup_short', 'dest_short'],
      ['pickup_lat', 'dest_lat'],
      ['pickup_lng', 'dest_lng'],
    ];

    pairs.forEach(([fromKey, toKey]) => {
      const fromControl = form.get(fromKey);
      const toControl = form.get(toKey);
      if (!fromControl || !toControl) return;

      const fromValue = fromControl.value;
      fromControl.setValue(toControl.value ?? '');
      toControl.setValue(fromValue ?? '');
    });
  }

  get currentLangCode(): string {
    return this.langInput?.code ?? this.languageService.currentLang().code;
  }
 

  // translations for from, to, from placeholder, to placeholder, search, book your transfer, description
  translations: any = {
    heroBadge: {
      en: 'VIP Airport Transfers Antalya & Istanbul',
      de: 'VIP Flughafentransfers Antalya & Istanbul',
      ru: 'VIP трансферы из аэропорта Анталии и Стамбула',
      tr: 'VIP Havalimanı Transferleri Antalya & İstanbul',
    },
    from: {
      en: 'From', 
      de: 'Von',
      ru: 'От',
      tr: 'Nereden',
    }, 
    from_required: {
      en: 'Pickup location is required.',
      de: 'Abholort ist erforderlich.',
      ru: 'Место взятия обязательно.',
      tr: 'Alınacak yer gereklidir.',
    }, 
    to: {
      en: 'To', 
      de: 'Nach',
      ru: 'До',
      tr: 'Nereye',
    },
    to_required: {
      en: 'Destination location is required.', 
      de: 'Zielort ist erforderlich.',
      ru: 'Пункт назначения обязателен.',
      tr: 'Gidilecek yer gereklidir.',
    }, 
    from_placeholder: {
      en: 'Enter pickup location', 
      de: 'Abholort eingeben',
      ru: 'Введите место взятия',
      tr: 'Alınacak yer',
    },
    to_placeholder: {
      en: 'Enter destination', 
      de: 'Ziel eingeben',
      ru: 'Введите пункт назначения',
      tr: 'Gidilecek yer',
    },
    clearPickup: {
      en: 'Clear pickup field',
      de: 'Abholort löschen',
      ru: 'Очистить место отправления',
      tr: 'Alış alanını temizle',
    },
    clearDropOff: {
      en: 'Clear drop-off field',
      de: 'Zielort löschen',
      ru: 'Очистить пункт назначения',
      tr: 'Varış alanını temizle',
    },
    search: {
      en: 'Search', 
      de: 'Suche',
      ru: 'Поиск',
      tr: 'Ara',
    },
    book_your_transfer: {
      en: 'Istanbul & Antalya Airport Transfer Service', 
      de: 'Flughafentransfer Antalya & Istanbul',
      ru: 'Трансфер из аэропорта Анталии и Стамбула',
      tr: 'İstanbul & Antalya Havalimanı Transferi',
    },
    description: {
      en: 'Reserve your private chauffeur in Antalya or Istanbul for meet-and-greet pickup, nonstop resort transfers, and Mercedes VIP comfort at fixed prices.',
      de: 'Reservieren Sie Ihren privaten Chauffeur in Antalya oder Istanbul für Meet-and-Greet, Nonstop-Resorttransfers und VIP-Komfort zu Festpreisen.',
      ru: 'Забронируйте личного водителя в Анталии или Стамбуле: встреча у терминала, прямой трансфер в отель и комфорт VIP-класса по фиксированной цене.',
      tr: 'Antalya veya İstanbul’da özel şoförünüzü ayırtın: karşılama hizmeti, otele kesintisiz transfer ve sabit fiyatlı Mercedes VIP konforu.',
    }, 
    benefitMeetGreet: {
      en: 'Professional meet & greet at Antalya AYT and Istanbul IST/SAW terminals',
      de: 'Professioneller Meet & Greet an den Terminals Antalya AYT und Istanbul IST/SAW',
      ru: 'Профессиональная встреча с табличкой в аэропортах Анталии (AYT) и Стамбула (IST/SAW)',
      tr: 'Antalya AYT ile İstanbul IST/SAW terminallerinde profesyonel karşılama',
    },
    benefitOnTime: {
      en: 'Real-time flight tracking and express highway routes to coastal resorts',
      de: 'Echtzeit-Flugtracking und Expressrouten zu Küstenresorts',
      ru: 'Отслеживание рейсов в реальном времени и быстрые маршруты к курортам побережья',
      tr: 'Gerçek zamanlı uçuş takibi ve sahil otellerine hızlı otoyol rotaları',
    },
    benefitSupport: {
      en: '24/7 WhatsApp concierge for last-minute Antalya private transfers',
      de: '24/7 WhatsApp-Concierge für kurzfristige Antalya-Privattransfers',
      ru: 'Круглосуточный WhatsApp-консьерж для срочных VIP-трансферов в Анталии',
      tr: 'Antalya’daki acil VIP transferler için 7/24 WhatsApp concierge',
    },
    benefitFleet: {
      en: 'Black Mercedes Vito, V-Class, S-Class and Sprinter vans with child seats on request',
      de: 'Schwarze Mercedes Vito, V-Klasse, S-Klasse und Sprinter mit Kindersitzen auf Wunsch',
      ru: 'Черные Mercedes Vito, V-Class, S-Class и Sprinter; детские кресла по запросу',
      tr: 'Talebe göre çocuk koltuklu siyah Mercedes Vito, V-Class, S-Class ve Sprinter',
    },
    benefitCoverage: {
      en: 'Direct Antalya airport transfer to Belek, Lara, Side, Kemer, Alanya & Istanbul hotel districts',
      de: 'Direkter Flughafentransfer Antalya nach Belek, Lara, Side, Kemer, Alanya und Istanbuler Hotels',
      ru: 'Прямые трансферы из аэропорта Анталии в Белек, Лару, Сиде, Кемер, Аланью и районы Стамбула',
      tr: 'Antalya havalimanından Belek, Lara, Side, Kemer, Alanya ve İstanbul otel bölgelerine direkt transfer',
    },
    helperLine: {
      en: 'Enter hotel, villa, or cruise port details to unlock Antalya airport VIP car options and instant fares.',
      de: 'Geben Sie Hotel-, Villa- oder Kreuzfahrthafen-Daten ein, um Antalya VIP-Transferfahrzeuge und Sofortpreise zu sehen.',
      ru: 'Укажите отель, виллу или круизный порт, чтобы открыть VIP-авто и тарифы для аэропорта Анталии.',
      tr: 'Antalya havalimanı VIP araç seçenekleri ve anlık fiyatlar için otel, villa veya liman bilgilerini ekleyin.',
    },
    mobileFormTitle: {
      en: 'Book Your Istanbul & Antalya Airport Transfer',
      de: 'Buchen Sie Ihren Flughafentransfer Istanbul & Antalya',
      ru: 'Забронируйте трансфер из аэропортов Стамбула и Анталии',
      tr: 'İstanbul ve Antalya Havalimanı Transferinizi Ayırtın',
    },
    seoParagraphOne: {
      en: 'Trusted Antalya airport transfer company for VIP rides to Belek resorts, Lara Beach hotels, Side villas, Kemer marinas, Alanya clubs, and Istanbul city breaks. We track every flight, assist with luggage, and seat you in a polished Mercedes within minutes.',
      de: 'Ihr vertrauenswürdiger Antalya Flughafentransfer für VIP-Fahrten zu Resorts in Belek, Lara Beach Hotels, Side Villen, Kemer Marinas, Alanya Clubs und Citytrips nach Istanbul. Wir verfolgen jeden Flug, helfen mit dem Gepäck und bringen Sie in wenigen Minuten in einen makellosen Mercedes.',
      ru: 'Надёжный трансфер из аэропорта Анталии для VIP-поездок в отели Белека, на пляж Лара, виллы Сиде, марину Кемера, клубы Аланьи и в Стамбул. Мы отслеживаем рейс, помогаем с багажом и подаем безупречный Mercedes в считанные минуты.',
      tr: 'Belek resortları, Lara Beach otelleri, Side villaları, Kemer marinaları, Alanya eğlence merkezleri ve İstanbul şehir kaçamakları için güvenilir Antalya havalimanı VIP transferi. Uçuşunuzu takip eder, bagajınıza destek olur ve dakikalar içinde parlak bir Mercedes’e geçiririz.',
    },
    seoParagraphTwo: {
      en: 'Book Antalya airport to hotel transfer, Istanbul airport to city VIP taxi, or private multi-stop tours with 24/7 English, German, Russian, and Turkish support. Fixed prices include chilled water, Wi-Fi, baby seats, and the option to pay on arrival.',
      de: 'Buchen Sie den Antalya Flughafentransfer zum Hotel, ein Istanbul Airport VIP Taxi in die Stadt oder private Mehrstopp-Touren mit 24/7 Support auf Englisch, Deutsch, Russisch und Türkisch. Festpreise inklusive Wasser, WLAN, Kindersitzen und Zahlung bei Ankunft.',
      ru: 'Бронируйте трансфер из аэропорта Анталии в отель, VIP такси из аэропорта Стамбула в центр или индивидуальные туры с водителем и поддержкой 24/7 на английском, немецком, русском и турецком. Фиксированные цены включают воду, Wi‑Fi, детские кресла и оплату по приезду.',
      tr: 'Antalya havalimanından otele transferi, İstanbul havalimanından şehre VIP taksiyi veya özel çok duraklı turları 7/24 İngilizce, Almanca, Rusça ve Türkçe destekle rezerve edin. Sabit fiyatlar soğuk su, Wi-Fi, bebek koltuğu ve varışta ödeme seçeneğini içerir.',
    },
    swapLocations: {
      en: 'Switch locations',
      de: 'Orte tauschen',
      ru: 'Поменять местами',
      tr: 'Konumları değiştir',
    },
    fixedPrices: {
      en: 'Or You can choose from fixed prices...',
      de: 'Oder Sie können aus Festpreisen wählen...',
      ru: 'Или вы можете выбрать из фиксированных цен...',
      tr: 'Ya da sabit fiyatlar arasından seçim yapabilirsiniz...',
    },
    errorTitle: {
      en: 'Can’t find your destination?',
      de: 'Sie finden Ihr Ziel nicht?',
      ru: 'Не находите нужное направление?',
      tr: 'Aradığınız destinasyonu bulamadınız mı?',
    },
    errorText: {
      en: 'No worries — our concierge team will curate the perfect route. Choose any option below and we will handle the rest.',
      de: 'Keine Sorge – unser Concierge-Team stellt die ideale Route für Sie zusammen. Wählen Sie eine Option unten, wir kümmern uns um den Rest.',
      ru: 'Не переживайте — наш консьерж подберёт лучший маршрут. Выберите удобный способ связи ниже, и мы все организуем.',
      tr: 'Endişelenmeyin — concierge ekibimiz sizin için en uygun rotayı planlar. Aşağıdaki seçeneklerden birini seçmeniz yeterli.',
    },
    contactWhatsapp: {
      en: 'WhatsApp',
      de: 'WhatsApp',
      ru: 'WhatsApp',
      tr: 'WhatsApp',
    },
    contactTelegram: {
      en: 'Telegram',
      de: 'Telegram',
      ru: 'Telegram',
      tr: 'Telegram',
    },
    contactPhone: {
      en: 'Phone',
      de: 'Telefon',
      ru: 'Телефон',
      tr: 'Telefon',
    },
    contactEmail: {
      en: 'Email',
      de: 'E-Mail',
      ru: 'Email',
      tr: 'E-posta',
    }
  }
}
