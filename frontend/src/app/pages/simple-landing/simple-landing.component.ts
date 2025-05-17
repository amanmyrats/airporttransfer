import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../admin/services/reservation.service';
import { Reservation } from '../../admin/models/reservation.model';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BookingService } from '../../services/booking.service';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { SOCIAL_ICONS } from '../../constants/social.constants';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';

@Component({
  selector: 'app-simple-landing',
  imports: [
    ReactiveFormsModule, CommonModule, 
    SuperHeaderComponent, NavbarComponent, FooterComponent, 
  ],
  templateUrl: './simple-landing.component.html',
  styleUrl: './simple-landing.component.scss'
})
export class SimpleLandingComponent implements OnInit {
  currentLanguage = {code: 'en', name: 'English', flag: 'flags/gb.svg'};

  isSubmitting = false;
  formSubmitted = false; // New flag to track submission attempts

  reservationForm: FormGroup;
  socialIcons: any = SOCIAL_ICONS;
  navbarMenu: any = NAVBAR_MENU;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private bookingService: BookingService,
    private router: Router,
    private route: ActivatedRoute, 
    private title: Title, 
    private meta: Meta, 
  ) {
    this.reservationForm = this.fb.group({
      passenger_name: ['', Validators.required],
      passenger_phone: ['', Validators.required],
      passenger_email: ['']
    });
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

    const reservation: Reservation = {
      ...this.reservationForm.value,
      status: 'pending'
    };

    this.isSubmitting = true;

    this.bookingService.createBooking(reservation).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Reservation created successfully:', response);
        this.router.navigate([`${this.currentLanguage.code}/${this.navbarMenu.simpleLanding2.slug[this.currentLanguage.code]}`], { state: { reservationId: response.one_way.id } });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Reservation creation failed:', err);
        // alert('Something went wrong. Please try again.');
      }
    });
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

  translations: any = {
    h1: {
      en: 'Private Airport Transfer Services in Turkey',
      de: 'Private Flughafentransferdienste in der Türkei',
      ru: 'Частные услуги трансфера в аэропорту Турции',
      tr: 'Türkiye\'de Özel Havalimanı Transfer Hizmetleri',
    }, 
    p: {
      en: 'Fast & Reliable 24/7 Transfers in Turkey. Book Now for Comfortable & Safe Travel.', 
      de: 'Schnelle und zuverlässige Transfers in der Türkei rund um die Uhr. Jetzt buchen für komfortable und sichere Reisen.',
      ru: 'Быстрые и надежные трансферы в Турции 24/7. Забронируйте сейчас для комфортных и безопасных поездок.',
      tr: 'Türkiye\'de Hızlı ve Güvenilir 24/7 Transferler. Rahat ve Güvenli Seyahat için Şimdi Rezervasyon Yapın.',
    }, 
    hotline: {
      en: 'HOT LINE',
      de: 'HEISSE LEITUNG',
      ru: 'ГОРЯЧАЯ ЛИНИЯ',
      tr: 'SICAK HAT',
    }, 
    fullname: {
      en: 'Full Name',
      de: 'Vollständiger Name',
      ru: 'Полное имя',
      tr: 'Tam Ad',
    },
    phone: {
      en: 'Phone Number',
      de: 'Telefonnummer',
      ru: 'Номер телефона',
      tr: 'Telefon Numarası',
    },
    email: {
      en: 'Email Address',
      de: 'E-Mail-Addresse',
      ru: 'Адрес электронной почты',
      tr: 'E-posta Adresi',
    },
    fullname_required: {
      en: 'Please enter your full name.',
      de: 'Bitte geben Sie Ihren vollständigen Namen ein.',
      ru: 'Пожалуйста, введите ваше полное имя.',
      tr: 'Lütfen tam adınızı girin.',
    },
    phone_required: {
      en: 'Please enter your phone number.',
      de: 'Bitte geben Sie Ihre Telefonnummer ein.',
      ru: 'Пожалуйста, введите ваш номер телефона.',
      tr: 'Lütfen telefon numaranızı girin.',
    },
    form_invalid: {
      en: 'Please fill in all required fields before submitting the reservation.',
      de: 'Bitte füllen Sie alle erforderlichen Felder aus, bevor Sie die Reservierung absenden.',
      ru: 'Пожалуйста, заполните все обязательные поля перед отправкой бронирования.',
      tr: 'Rezervasyonu göndermeden önce lütfen tüm gerekli alanları doldurun.',
    },
    submitting: {
      en: 'Submitting...',
      de: 'Einreichen...',
      ru: 'Отправка...',
      tr: 'Gönderiliyor...',
    },
    makeReservationNow: {
      en: 'Make a Reservation Now',
      de: 'Jetzt reservieren',
      ru: 'Забронировать сейчас',
      tr: 'Şimdi Rezervasyon Yapın',
    },

  }
}
