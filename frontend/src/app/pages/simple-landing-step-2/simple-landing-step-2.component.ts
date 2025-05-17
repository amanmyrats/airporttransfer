import { Component, computed, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../admin/services/reservation.service';
import { Reservation } from '../../admin/models/reservation.model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BookingService } from '../../services/booking.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { GmapsAutocompleteDirective } from '../../directives/gmaps-autocomplete.directive';
import { SOCIAL_ICONS } from '../../constants/social.constants';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { LanguageService } from '../../services/language.service';
import { SUPPORTED_CAR_TYPES } from '../../constants/car-type.constants';
import { CarType } from '../../models/car-type.model';
import { CurrencyService } from '../../services/currency.service';
import { Meta, Title } from '@angular/platform-browser';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';

@Component({
  selector: 'app-simple-landing-step-2',
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    SuperHeaderComponent, NavbarComponent, FooterComponent, 
    GmapsAutocompleteDirective, 
    
  ],
  templateUrl: './simple-landing-step-2.component.html',
  styleUrl: './simple-landing-step-2.component.scss'
})
export class SimpleLandingStep2Component implements OnInit {
  currentLanguage = {code: 'en', name: 'English', flag: 'flags/gb.svg'};
  
  socialIcon = SOCIAL_ICONS;
  bookingService = inject(BookingService);
  priceCalculatorService = inject(PriceCalculatorService);
  currencyService = inject(CurrencyService);

  isSubmitting = false;
  reservationForm: FormGroup;
  formSubmitted = false;

  carTypes: CarType[] = SUPPORTED_CAR_TYPES;
  navbarMenu: any = NAVBAR_MENU;
  
  priceCalculationFailed = false; // Track if price couldn't be calculated


  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private router: Router, 
    private googleMapsService: GoogleMapsService, 
    public languageService: LanguageService, 
    private route: ActivatedRoute, 
    private title: Title, 
    private meta: Meta, 
  ) {
    this.reservationForm = this.fb.group({
      id: [''],
      pickup_full: ['', Validators.required], // From Location
      dest_full: ['', Validators.required],   // To Location
      pickup_lat: [''],
      pickup_lng: [''],
      dest_lat: [''],
      dest_lng: [''],
      transfer_date: ['', Validators.required],
      transfer_time: ['', Validators.required],
      child_seat_count: ['0'],
      passenger_count: ['1', Validators.required], // Adults default 1
      passenger_count_child: ['0'],
      note: [''], 

      distance: [0], 
      driving_duration: [0],
      airport_coefficient: [1], 
      amount: [0],
      currency_code: [''],

      status: ['pending'],

    });



    // Check if the state is available
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      const state = navigation.extras.state as { reservationId: number };
      if (state.reservationId) {
        this.reservationForm.patchValue({ id: state.reservationId });
        console.log('Reservation ID from state:', state.reservationId);
      } else {
        console.error('No reservation ID found in state.');
        // navigate to step 1
        this.router.navigate([`${this.currentLanguage.code}/${this.navbarMenu.simpleLanding1.slug[this.currentLanguage.code]}`]);
      }
    } else {
      console.error('No navigation.extras.state.');
      // navigate to step 1
      this.router.navigate([`${this.currentLanguage.code}/${this.navbarMenu.simpleLanding1.slug[this.currentLanguage.code]}`]);
    }


  }


  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;

    this.setMetaTags(this.currentLanguage.code);
  }

  submitForm() {
    this.formSubmitted = true;

    console.log('Form submitted:', this.reservationForm.value);
    if (this.reservationForm.invalid) return;

    this.isSubmitting = true;
    const id = this.reservationForm.get('id')?.value;
    this.bookingService.updateBooking(id, this.reservationForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.router.navigate([`${this.currentLanguage.code}/${this.navbarMenu.simpleLanding3.slug[this.currentLanguage.code]}`], 
          { state: 
            { 
              oneWayInfo : {
                number: res.number,
                status: res.status,
              } 
            }
          }
        );
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Reservation Step 2 failed:', err);
        alert('Something went wrong. Please try again.');
      }
    });
  }


  onPickupPlaceChanged(place: google.maps.places.PlaceResult): void {
    console.log('Pickup place selected:', place);
    const pickup_full = this.googleMapsService.getFormattedAddress(place);
    const pickup_lat = this.googleMapsService.getLatitude(place);
    const pickup_lng = this.googleMapsService.getLongitude(place);
    this.reservationForm.patchValue({
      pickup_full: pickup_full, pickup_lat: pickup_lat, pickup_lng: pickup_lng
    });
    this.checkAndCalculatePrice();
  }

  onDestPlaceChanged(place: google.maps.places.PlaceResult): void {
    console.log('Destination place selected:', place);
    const dest_full = this.googleMapsService.getFormattedAddress(place);
    const dest_lat = this.googleMapsService.getLatitude(place);
    const dest_lng = this.googleMapsService.getLongitude(place);
    this.reservationForm.patchValue({
      dest_full: dest_full, dest_lat: dest_lat, dest_lng: dest_lng
    });
    this.checkAndCalculatePrice();
  }
  
  checkAndCalculatePrice() {
    console.log('reservationForm:', this.reservationForm.value);
    const pickupLat: number = this.reservationForm.get('pickup_lat')?.value;
    const pickupLng: number = this.reservationForm.get('pickup_lng')?.value;
    const destLat: number = this.reservationForm.get('dest_lat')?.value;
    const destLng: number = this.reservationForm.get('dest_lng')?.value;
    if (!pickupLat || !pickupLng || !destLat || !destLng) {
      this.priceCalculationFailed = true;
      return;
    }
  
    const origin: google.maps.LatLngLiteral = { lat: pickupLat, lng: pickupLng };
    const destination: google.maps.LatLngLiteral = { lat: destLat, lng: destLng };

    console.log('Origin:', origin);
    console.log('Destination:', destination);

    const airportCoefficientPickUp = this.priceCalculatorService.getAirportCoefficient(pickupLat, pickupLng);
    const airportCoefficientDest = this.priceCalculatorService.getAirportCoefficient(destLat, destLng);

    console.log('Coefficients:', airportCoefficientPickUp, airportCoefficientDest);
    this.reservationForm.get('airport_coefficient')!.setValue(
      Math.max(airportCoefficientPickUp, airportCoefficientDest)
    );    
    
    this.googleMapsService.calculateDrivingDistanceAndTime(origin, destination
    ).then(result => {
      console.log('Distance and duration:', result);
      this.reservationForm.get('distance')!.setValue(
        Math.floor(result.distance));
      this.reservationForm.get('driving_duration')!.setValue(
        Math.floor(result.duration));
    
    const carVito = this.carTypes.find(carType => carType.code === 'VITO');
    const priceInEuros = this.priceCalculatorService.calculateFixedPrice(
        this.reservationForm.get('distance')!.value,
        carVito!, 
        this.reservationForm.get('airport_coefficient')!.value
      );
    const price =  this.priceCalculatorService.getRoundedPrice(
        priceInEuros, 
        this.currencyService.currentCurrency().code!, 
        this.currencyService.currentCurrency().rate!)


    this.reservationForm.get('amount')!.setValue(price);
    this.reservationForm.get('currency_code')!.setValue(this.currencyService.currentCurrency().code!);
    this.priceCalculationFailed = false;
    this.priceCalculationFailed = false;

  }).catch(error => {
    console.error('Error calculating distance:', error);
    this.priceCalculationFailed = true;

  });
  }

  preventFormSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the form from submitting
    }
  }
  

  // translations for from, to, from placeholder, to placeholder, search, book your transfer, description
  translations: any = {
    step_2_of_2: {
      en: 'Step 2 of 2', 
      de: 'Schritt 2 von 2',
      ru: 'Шаг 2 из 2',
      tr: '2. Adım / 2',
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
    search: {
      en: 'Search', 
      de: 'Suche',
      ru: 'Поиск',
      tr: 'Ara',
    },
    book_your_transfer: {
      en: 'Book Your Airport Transfer', 
      de: 'Buchen Sie Ihren Flughafentransfer',
      ru: 'Забронируйте ваш трансфер из аэропорта',
      tr: 'Havalimanı Transferinizi Ayırtın',
    },
    description: {
      en: 'Plan your journey in just a few steps. Choose your destination, date, and time, and enjoy a seamless travel experience.',
      de: 'Planen Sie Ihre Reise in nur wenigen Schritten. Wählen Sie Ihr Ziel, Datum und Uhrzeit und genießen Sie ein nahtloses Reiseerlebnis.',
      ru: 'Запланируйте свое путешествие всего в несколько шагов. Выберите ваш пункт назначения, дату и время и наслаждайтесь безупречным путешествием.',
      tr: 'Yolculuğunuzu sadece birkaç adımda planlayın. Gidilecek yerinizi, tarihinizi ve saatinizi seçin ve sorunsuz bir seyahat deneyiminin tadını çıkarın.',
    }, 
    fixedPrices: {
      en: 'Or You can choose from fixed prices...',
      de: 'Oder Sie können aus Festpreisen wählen...',
      ru: 'Или вы можете выбрать из фиксированных цен...',
      tr: 'Ya da sabit fiyatlar arasından seçim yapabilirsiniz...',
    }, 
    estimatedPrice: {
      en: 'Estimated Price',
      de: 'Geschätzter Preis',
      ru: 'Предполагаемая цена',
      tr: 'Tahmini Fiyat',
    },
    priceFallback: {
      en: 'Automatic price calculation is not available for this route. Please submit your reservation, and we will contact you via WhatsApp to discuss the best offer.',
      de: 'Die automatische Preisberechnung ist für diese Route nicht verfügbar. Bitte senden Sie Ihre Reservierung, und wir werden Sie über WhatsApp kontaktieren, um das beste Angebot zu besprechen.',
      ru: 'Автоматический расчет цены недоступен для этого маршрута. Пожалуйста, отправьте свой запрос, и мы свяжемся с вами через WhatsApp, чтобы обсудить лучшее предложение.',
      tr: 'Bu güzergah için otomatik fiyat hesaplaması mevcut değil. Lütfen rezervasyonunuzu gönderin, ve en iyi teklifi görüşmek için WhatsApp üzerinden sizinle iletişime geçeceğiz.',
    },
    selectBothLocations: {
      en: 'Please select both pickup and destination locations to calculate the price.',
      de: 'Bitte wählen Sie sowohl den Abhol- als auch den Zielort aus, um den Preis zu berechnen.',
      ru: 'Пожалуйста, выберите как место забора, так и пункт назначения, чтобы рассчитать цену.',
      tr: 'Fiyatı hesaplamak için hem alınacak hem de varış yerini seçin.',
    }, 
    transfer_date: {
      en: 'Transfer Date',
      de: 'Transferdatum',
      ru: 'Дата трансфера',
      tr: 'Transfer Tarihi',
    },
    transfer_time: {
      en: 'Transfer Time',
      de: 'Transferzeit',
      ru: 'Время трансфера',
      tr: 'Transfer Saati',
    },
    transfer_date_required: {
      en: 'Please select a transfer date.', 
      de: 'Bitte wählen Sie ein Transferdatum aus.',
      ru: 'Пожалуйста, выберите дату трансфера.',
      tr: 'Lütfen bir transfer tarihi seçin.',
    },
    transfer_time_required: {
      en: 'Please select a transfer time.',
      de: 'Bitte wählen Sie eine Transferzeit aus.',
      ru: 'Пожалуйста, выберите время трансфера.',
      tr: 'Lütfen bir transfer saati seçin.',
    },
    adult_count: {
      en: 'Number of Adults',
      de: 'Anzahl der Erwachsenen',
      ru: 'Количество взрослых',
      tr: 'Yetişkin Sayısı',
    },
    child_count: {
      en: 'Number of Children',
      de: 'Anzahl der Kinder',
      ru: 'Количество детей',
      tr: 'Çocuk Sayısı',
    },
    child_seat: {
      en: 'Child Seat',
      de: 'Kindersitz',
      ru: 'Детское кресло',
      tr: 'Çocuk Koltuğu',
    }, 
    note: {
      en: 'Additional Notes (optional)',
      de: 'Zusätzliche Hinweise (optional)',
      ru: 'Дополнительные заметки (по желанию)',
      tr: 'Ekstra Notlar (isteğe bağlı)',
    },
    form_validation: {
      en: 'Please fill in all required fields.',
      de: 'Bitte füllen Sie alle erforderlichen Felder aus.',
      ru: 'Пожалуйста, заполните все обязательные поля.',
      tr: 'Lütfen tüm gerekli alanları doldurun.',
    },
    submitting: {
      en: 'Submitting...',
      de: 'Einreichen...',
      ru: 'Отправка...',
      tr: 'Gönderiliyor...',
    }, 
    submit: {
      en: 'Submit Reservation',
      de: 'Reservierung einreichen',
      ru: 'Отправить резервацию',
      tr: 'Rezervasyonu Gönder',
    },
    any_special_requests: {
      en: 'Any special requests?',
      de: 'Irgendwelche Sonderwünsche?',
      ru: 'Есть особые пожелания?',
      tr: 'Herhangi bir özel isteğiniz var mı?',
    },
  }

  setMetaTags(langCode: string): void {

    const metaTags: any = {
      en: {
        title: 'Quick and Easy Airport Transfer Booking in Turkey',
        description: 'Book your airport transfer in Turkey quickly and easily. Enjoy a hassle-free experience with our reliable service.'
      },
      de: {
        title: 'Schnelle und einfache Buchung von Flughafentransfers in der Türkei',
        description: 'Buchen Sie Ihren Flughafentransfer in der Türkei schnell und einfach. Genießen Sie ein stressfreies Erlebnis mit unserem zuverlässigen Service.'
      },
      ru: {
        title: 'Быстрое и простое бронирование трансфера в аэропорт в Турции',
        description: 'Забронируйте трансфер в аэропорт в Турции быстро и легко. Наслаждайтесь беззаботным обслуживанием с нашей надежной службой.'
      },
      tr: { 
        title: 'Türkiye\'de Hızlı ve Kolay Havalimanı Transferi Rezervasyonu',
        description: 'Türkiye\'de havalimanı transferinizi hızlı ve kolay bir şekilde rezerve edin. Güvenilir hizmetimizle zahmetsiz bir deneyimin tadını çıkarın.'
      }
    };

    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
}
