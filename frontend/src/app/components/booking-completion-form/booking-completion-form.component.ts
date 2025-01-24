import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { MessageModule } from 'primeng/message';
import { CarTypeService } from '../../services/car-type.service';
import { CurrencyService } from '../../services/currency.service';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabel } from 'primeng/floatlabel';
import { SelectButton } from 'primeng/selectbutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';

@Component({
  selector: 'app-booking-completion-form',
  imports: [
    CommonModule, 
    FormsModule, ReactiveFormsModule, 
    ButtonModule, MessageModule, 
    CheckboxModule, 
    ToggleSwitchModule, 
    InputNumberModule, 
  ],
  templateUrl: './booking-completion-form.component.html',
  styleUrl: './booking-completion-form.component.scss'
})
export class BookingCompletionFormComponent implements OnInit {
  navbar = NAVBAR_MENU;
  bookingService = inject(BookingService);
  carTypeService = inject(CarTypeService);
  currencyService = inject(CurrencyService);

  stepFromUrl: number | null = null;

  previousStep = output<any>();

  isSaving = false;
  hasSubmitted = false;

  needChildSeatOptions: any[] = [
    {label: 'Çocuk Koltuğu Lazım', value: true},
    {label: 'Lazım Değil', value: false},
  ];

  // Mock data for reservation details (these would typically come from a service or state)
  selectedCar = this.carTypeService.getCarTypeByCode(
    this.bookingService.bookingCarTypeSelectionForm.get('car_type')?.value
  ) 
  price = this.bookingService.bookingCarTypeSelectionForm.get('amount')?.value;
  currency = this.currencyService.getCurrencyByCode(
    this.bookingService.bookingCarTypeSelectionForm.get('currency_code')?.value
  )
  fromLocation = this.bookingService.bookingInitialForm.get('pickup_full')?.value;
  toLocation = this.bookingService.bookingInitialForm.get('dest_full')?.value;
  distance = this.bookingService.bookingCarTypeSelectionForm.get('distance')?.value;
  passengerCount = 333;

  constructor(
    private fb: FormBuilder, 
    private router: Router,  
    public languageService: LanguageService, 
    private route: ActivatedRoute, 
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.stepFromUrl = params['step'];
    });

    // Ensure the return fields are updated based on the "returnTrip" checkbox
    this.toggleReturnFields();
  }

  // Toggle the validators for return trip fields
  toggleReturnFields(): void {
    const returnDateControl = this.bookingService.bookingCompletionForm.get('return_transfer_date');
    const returnTimeControl = this.bookingService.bookingCompletionForm.get('return_transfer_time');
    const isReturnTrip = this.bookingService.bookingCompletionForm.get('is_round_trip')?.value;

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

  // Handle form submission
  onSubmit(): void {
    this.hasSubmitted = true;
    
    // add 2 other forms into this.bookingService.bookingCompletionForm
    this.bookingService.bookingForm.patchValue({
      ...this.bookingService.bookingInitialForm.value,
      ...this.bookingService.bookingCarTypeSelectionForm.value,
      ...this.bookingService.bookingCompletionForm.value,
    });
    console.log('Booking Form:', this.bookingService.bookingForm.value);
    if (this.bookingService.bookingForm.valid) {
      this.isSaving = true;
      console.log('Form is valid');
      this.bookingService.createBooking(
        this.bookingService.bookingForm.value).subscribe({
          next: (response) => {
            console.log('Reservation created successfully:', response);
            this.isSaving = false;
            this.router.navigate([`${this.languageService.currentLang().code}/${this.navbar.bookNow.slug[this.languageService.currentLang().code]}/received/`]);
          },
          error: (error) => {
            console.error('Error creating reservation:', error);
            this.isSaving = false;
          }
        });
      // Send data to a backend API or navigate to a confirmation page
    } else {
      console.log('Form is invalid');
    }
  }

  goToPreviousStep(): void {
    this.previousStep.emit(this.bookingService.bookingCompletionForm.value);
  }

// create translations for above texts line by line in en, de, ru, tr languages

  translations: any = {
    reservationDetails : {
      en: 'Reservation Details',
      de: 'Reservierungsdetails',
      ru: 'Детали бронирования',
      tr: 'Rezervasyon Detayları',
    }, 
    car: {
      en: 'Car', 
      de: 'Auto',
      ru: 'Автомобиль',
      tr: 'Araba',
    },
    from: {
      en: 'From', 
      de: 'Von',
      ru: 'От',
      tr: 'Nereden',
    },
    to: {
      en: 'To', 
      de: 'Nach',
      ru: 'До',
      tr: 'Nereye',
    }, 
    price: {
      en: 'Price', 
      de: 'Preis',
      ru: 'Цена',
      tr: 'Fiyat',
    }, 
    distance: {
      en: 'Distance', 
      de: 'Entfernung',
      ru: 'Расстояние',
      tr: 'Mesafe',
    }, 
    completeYourReservation: {
      en: 'Complete Your Reservation',
      de: 'Vervollständigen Sie Ihre Reservierung',
      ru: 'Завершите вашу бронь',
      tr: 'Rezervasyonunuzu Tamamlayın',
    },
    travelAndFlightInfo: {
      en: 'Travel and Flight Information', 
      de: 'Reise- und Fluginformationen',
      ru: 'Информация о поездке и рейсе',
      tr: 'Seyahat ve Uçuş Bilgileri',
    }, 
    transferDate: {
      en: 'Transfer Date', 
      de: 'Transferdatum',
      ru: 'Дата трансфера',
      tr: 'Transfer Tarihi',
    }, 
    transferTime: {
      en: 'Transfer Time', 
      de: 'Transferzeit',
      ru: 'Время трансфера',
      tr: 'Transfer Zamanı',
    }, 
    flightNumber: {
      en: 'Flight Number', 
      de: 'Flugnummer',
      ru: 'Номер рейса',
      tr: 'Uçuş Numarası',
    }, 
    returnTransfer: {
      en: 'Want Return Transfer?',
      de: 'Möchten Sie einen Rücktransfer?',
      ru: 'Хотите обратный трансфер?',
      tr: 'Dönüş Transferi İster misiniz?',
    },
    returnTransferDate: {
      en: 'Return Transfer Date',
      de: 'Rücktransferdatum',
      ru: 'Дата обратного трансфера',
      tr: 'Dönüş Transfer Tarihi',
    }, 
    returnTransferTime: {
      en: 'Return Transfer Time', 
      de: 'Rücktransferzeit',
      ru: 'Время обратного трансфера',
      tr: 'Dönüş Transfer Zamanı',
    },
    personalInfo: {
      en: 'Personal Information', 
      de: 'Persönliche Informationen',
      ru: 'Личная информация',
      tr: 'Kişisel Bilgiler',
    }, 
    fullName: {
      en: 'Name and Surname', 
      de: 'Vor- und Nachname',
      ru: 'Имя и фамилия',
      tr: 'Ad ve Soyad',
    }, 
    email: {
      en: 'Email', 
      de: 'Email',
      ru: 'Эл. адрес',
      tr: 'Email',
    }, 
    phone: {
      en: 'Phone', 
      de: 'Telefon',
      ru: 'Телефон',
      tr: 'Telefon',
    }, 
    primaryPhone: {
      en: 'Primary Phone', 
      de: 'Primäres Telefon',
      ru: 'Основной телефон',
      tr: 'Birincil Telefon',
    }, 
    additionalPhone: {
      en: 'Additional Phone', 
      de: 'Zusätzliches Telefon',
      ru: 'Дополнительный телефон',
      tr: 'Ek Telefon',
    }, 
    passengerCount: {
      en: 'Passenger Count', 
      de: 'Passagieranzahl',
      ru: 'Количество пассажиров',
      tr: 'Yolcu Sayısı',
    }, 
    childCount: {
      en: 'Child Count', 
      de: 'Kinderanzahl',
      ru: 'Количество детей',
      tr: 'Çocuk Sayısı',
    }, 
    extraServices: {
      en: 'Extra Services', 
      de: 'Zusatzleistungen',
      ru: 'Дополнительные услуги',
      tr: 'Ek Hizmetler',
    }, 
    needChildSeat: {
      en: 'Need Child Seat?', 
      de: 'Brauchen Sie einen Kindersitz?',
      ru: 'Нужен детский кресло?',
      tr: 'Çocuk Koltuğu Gerekli mi?',
    }, 
    note: {
      en: 'Note',
      de: 'Hinweis',
      ru: 'Примечание',
      tr: 'Not',
    }, 
    notePlaceholder: {
      en: 'Write any additional details...', 
      de: 'Schreiben Sie weitere Details...',
      ru: 'Напишите любые дополнительные сведения...',
      tr: 'Herhangi ek detayları yazın...',
    }, 
    payment: {
      en: 'Payment', 
      de: 'Zahlung',
      ru: 'Оплата',
      tr: 'Ödeme',
    }, 
    paymentNote: {
      en: 'Pay cash to the driver after your trip. No payment is required until you\'re fully satisfied.', 
      de: 'Zahlen Sie bar an den Fahrer nach Ihrer Reise. Es ist keine Zahlung erforderlich, bis Sie vollständig zufrieden sind.',
      ru: 'Оплатите наличными водителю после поездки. Оплата не требуется, пока вы полностью не удовлетворены.',
      tr: 'Seyahatinizden sonra sürücüye nakit ödeyin. Tamamen memnun olana kadar ödeme yapmanız gerekmez.',
    }, 
    back: {
      en: 'Back', 
      de: 'Zurück',
      ru: 'Назад',
      tr: 'Geri',
    }, 
    fieldRequired: {
      en: 'This field is required', 
      de: 'Dieses Feld ist erforderlich',
      ru: 'Это поле обязательно',
      tr: 'Bu alan gereklidir',
    }, 
    formError: {
      en: 'Please fill required fields', 
      de: 'Bitte füllen Sie die erforderlichen Felder aus',
      ru: 'Пожалуйста, заполните обязательные поля',
      tr: 'Lütfen gerekli alanları doldurun',
    }, 
    yearsOld: {
      en: 'years old',
      de: 'Jahre alt',
      ru: 'лет',
      tr: 'yaşında',
    }, 
    completeReservation: {
      en: 'Complete Reservation', 
      de: 'Reservierung abschließen',
      ru: 'Завершить бронирование',
      tr: 'Rezervasyonu Tamamla',
    }
  }
}
