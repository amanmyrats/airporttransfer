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
import { SUPPORTED_CAR_TYPES } from '../../constants/car-type.constants';

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
  carTypes: any = SUPPORTED_CAR_TYPES;
  vitoCarType: any = SUPPORTED_CAR_TYPES.find((carType) => carType.code === 'VITO');

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
    seoContent: {
      en: `
        <h2>Private Airport Transfers in Turkey – Antalya, Istanbul, Alanya & More</h2>
        <p>We offer <strong>24/7 VIP private airport transfers</strong> across <em>Turkey’s major airports</em>, including 
        <strong>Antalya Airport (AYT)</strong>, <strong>Istanbul Airport (IST)</strong>, <strong>Sabiha Gökçen (SAW)</strong>, 
        <strong>Izmir (ADB)</strong>, and <strong>Alanya Gazipasa (GZP)</strong>.</p>
        <p>Our fleet includes <strong>Mercedes Vito, Sprinter, and luxury sedans</strong> with 
        <strong>free Wi-Fi, air conditioning, and professional drivers</strong>. Whether you’re traveling solo or with a group, 
        our tailored solutions guarantee comfort, safety, and punctuality.</p>
        <ul>
          <li>✅ Fixed prices – no hidden fees</li>
          <li>✅ Free cancellation up to 24 hours</li>
          <li>✅ English-speaking support & drivers</li>
          <li>✅ Meet & greet at the arrival gate</li>
        </ul>
        <p>Choose us for your <strong>hotel transfers, resort pickups</strong>, or <strong>city-to-city rides</strong> in Turkey.</p>
      `,
      de: `
        <h2>Private Flughafentransfers in der Türkei – Antalya, Istanbul, Alanya & mehr</h2>
        <p>Wir bieten <strong>24/7 VIP-Flughafentransfers</strong> an <em>den wichtigsten Flughäfen der Türkei</em>, darunter 
        <strong>Antalya (AYT)</strong>, <strong>Istanbul (IST)</strong>, <strong>Sabiha Gökçen (SAW)</strong>, 
        <strong>Izmir (ADB)</strong> und <strong>Alanya Gazipasa (GZP)</strong>.</p>
        <p>Unsere Flotte umfasst <strong>Mercedes Vito, Sprinter und Luxuslimousinen</strong> mit 
        <strong>kostenlosem WLAN, Klimaanlage und professionellen Fahrern</strong>. Ideal für Einzelreisende oder Gruppen.</p>
        <ul>
          <li>✅ Feste Preise – keine versteckten Gebühren</li>
          <li>✅ Kostenlose Stornierung bis 24 Stunden vorher</li>
          <li>✅ Englischsprachiger Support & Fahrer</li>
          <li>✅ Abholung direkt am Ankunftsgate</li>
        </ul>
        <p>Wählen Sie uns für <strong>Hoteltransfers, Resort-Abholungen</strong> oder <strong>Stadt-zu-Stadt Fahrten</strong> in der Türkei.</p>
      `,
      ru: `
        <h2>Частные трансферы в аэропорт в Турции – Анталья, Стамбул, Аланья и другие</h2>
        <p>Мы предлагаем <strong>VIP трансферы 24/7</strong> в <em>основные аэропорты Турции</em>, включая 
        <strong>Анталья (AYT)</strong>, <strong>Стамбул (IST)</strong>, <strong>Sabiha Gökçen (SAW)</strong>, 
        <strong>Измир (ADB)</strong> и <strong>Аланья Газипаша (GZP)</strong>.</p>
        <p>Наш автопарк включает <strong>Mercedes Vito, Sprinter и люксовые седаны</strong> с 
        <strong>Wi-Fi, кондиционером и профессиональными водителями</strong>. Подходит как для индивидуальных, так и для групповых поездок.</p>
        <ul>
          <li>✅ Фиксированные цены – без скрытых платежей</li>
          <li>✅ Бесплатная отмена до 24 часов</li>
          <li>✅ Водители и поддержка, говорящие на английском</li>
          <li>✅ Встреча в аэропорту</li>
        </ul>
        <p>Выбирайте нас для <strong>трансферов в отели, курорты</strong> или <strong>междугородних поездок</strong> по Турции.</p>
      `,
      tr: `
        <h2>Türkiye'de Özel Havalimanı Transferleri – Antalya, İstanbul, Alanya ve daha fazlası</h2>
        <p><em>Antalya Havalimanı (AYT)</em>, <strong>İstanbul (IST)</strong>, <strong>Sabiha Gökçen (SAW)</strong>, 
        <strong>İzmir (ADB)</strong> ve <strong>Alanya Gazipaşa (GZP)</strong> dahil olmak üzere 
        <strong>Türkiye'nin önde gelen havalimanlarında 7/24 VIP özel transfer hizmetleri</strong> sunuyoruz.</p>
        <p>Filo seçeneklerimiz arasında <strong>Mercedes Vito, Sprinter ve lüks sedanlar</strong> yer alır. 
        <strong>Wi-Fi, klima ve profesyonel sürücüler</strong> ile konforlu ve güvenli bir yolculuk sunuyoruz.</p>
        <ul>
          <li>✅ Sabit fiyat – sürpriz yok</li>
          <li>✅ 24 saat öncesine kadar ücretsiz iptal</li>
          <li>✅ İngilizce konuşan sürücüler ve destek</li>
          <li>✅ Karşılama hizmeti – Havalimanı kapısında buluşma</li>
        </ul>
        <p><strong>Otel transferleri, tatil köyü karşılamaları</strong> veya <strong>şehirler arası yolculuklar</strong> için bizimle çalışın.</p>
      `
    }, 
    mapImage: {
      image: {
        name: {
          en: '24-7-private-airport-transfer-map-turkey-istanbul-antalya-izmir-alanya.webp',
          de: '24-7-privater-flughafentransfer-karte-turkei-istanbul-antalya-izmir-alanya.webp',
          ru: '24-7-chastnyy-aeroport-transfert-karta-turciya-istanbul-antalya-izmir-alanya.webp',
          tr: '7-24-ozel-havalimani-transfer-haritasi-turkiye-istanbul-antalya-izmir-alanya.webp',
        },
        alt: {
          en: '24/7 Private Airport Transfer Map – Turkey: Istanbul, Antalya, Izmir, Alanya',
          de: '24/7 Karte Privater Flughafentransfer – Türkei: Istanbul, Antalya, Izmir, Alanya',
          ru: '24/7 Карта Частного Трансфера – Турция: Стамбул, Анталья, Измир, Аланья',
          tr: '7/24 Özel Havalimanı Transferi Haritası – Türkiye: İstanbul, Antalya, İzmir, Alanya',
        }
      },
      imageS: {
        name: {
          en: '24-7-private-airport-transfer-map-turkey-istanbul-antalya-izmir-alanya-s.webp',
          de: '24-7-privater-flughafentransfer-karte-turkei-istanbul-antalya-izmir-alanya-s.webp',
          ru: '24-7-chastnyy-aeroport-transfert-karta-turciya-istanbul-antalya-izmir-alanya-s.webp',
          tr: '7-24-ozel-havalimani-transfer-haritasi-turkiye-istanbul-antalya-izmir-alanya-s.webp',
        },
        alt: {
          en: '24/7 Private Airport Transfer Map – Turkey: Istanbul, Antalya, Izmir, Alanya',
          de: '24/7 Karte Privater Flughafentransfer – Türkei: Istanbul, Antalya, Izmir, Alanya',
          ru: '24/7 Карта Частного Трансфера – Турция: Стамбул, Анталья, Измир, Аланья',
          tr: '7/24 Özel Havalimanı Transferi Haritası – Türkiye: İstanbul, Antalya, İzmir, Alanya',
        }
      },
      imageM: {
        name: {
          en: '24-7-private-airport-transfer-map-turkey-istanbul-antalya-izmir-alanya-m.webp',
          de: '24-7-privater-flughafentransfer-karte-turkei-istanbul-antalya-izmir-alanya-m.webp',
          ru: '24-7-chastnyy-aeroport-transfert-karta-turciya-istanbul-antalya-izmir-alanya-m.webp',
          tr: '7-24-ozel-havalimani-transfer-haritasi-turkiye-istanbul-antalya-izmir-alanya-m.webp',
        },
        alt: {
          en: '24/7 Private Airport Transfer Map – Turkey: Istanbul, Antalya, Izmir, Alanya',
          de: '24/7 Karte Privater Flughafentransfer – Türkei: Istanbul, Antalya, Izmir, Alanya',
          ru: '24/7 Карта Частного Трансфера – Турция: Стамбул, Анталья, Измир, Аланья',
          tr: '7/24 Özel Havalimanı Transferi Haritası – Türkiye: İstanbul, Antalya, İzmir, Alanya',
        }
      },
      imageJpg: {
        name: {
          en: '24-7-private-airport-transfer-map-turkey-istanbul-antalya-izmir-alanya.jpg',
          de: '24-7-privater-flughafentransfer-karte-turkei-istanbul-antalya-izmir-alanya.jpg',
          ru: '24-7-chastnyy-aeroport-transfert-karta-turciya-istanbul-antalya-izmir-alanya.jpg',
          tr: '7-24-ozel-havalimani-transfer-haritasi-turkiye-istanbul-antalya-izmir-alanya.jpg',
        },
        alt: {
          en: '24/7 Private Airport Transfer Map – Turkey: Istanbul, Antalya, Izmir, Alanya',
          de: '24/7 Karte Privater Flughafentransfer – Türkei: Istanbul, Antalya, Izmir, Alanya',
          ru: '24/7 Карта Частного Трансфера – Турция: Стамбул, Анталья, Измир, Аланья',
          tr: '7/24 Özel Havalimanı Transferi Haritası – Türkiye: İstanbul, Antalya, İzmir, Alanya',
        }
      }
    }, 
    whatsappCta: {
      en: '💬 Chat & Book instantly via WhatsApp',
      de: '💬 Jetzt auf WhatsApp buchen',
      ru: '💬 Забронировать через WhatsApp',
      tr: '💬 WhatsApp ile Hemen Rezervasyon Yapın',
    }, 
    initialMessage: {
      en: 'Hello! I want to book a transfer.',
      de: 'Hallo! Ich möchte einen Transfer buchen.',
      ru: 'Здравствуйте! Я хочу забронировать трансфер.',
      tr: 'Merhaba! Bir transfer rezervasyonu yapmak istiyorum.',
    }
    
    
  }
}
