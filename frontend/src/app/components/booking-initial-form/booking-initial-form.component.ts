import { CommonModule } from '@angular/common';
import { Component, Input, output } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { PriceListComponent } from '../price-list/price-list.component';
import { BookingFormComponent, BookingSearchEvent } from '../booking-form/booking-form.component';

@Component({
  selector: 'app-booking-initial-form',
  imports: [
    CommonModule,
    BookingFormComponent,
    PriceListComponent, 
  ],
  templateUrl: './booking-initial-form.component.html',
  styleUrl: './booking-initial-form.component.scss'
})
export class BookingInitialFormComponent {
  @Input() langInput: any | null = null;

  searchVehicle = output<BookingSearchEvent>();

  constructor(public languageService: LanguageService) {}

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
    fixedPrices: {
      en: 'Or You can choose from fixed prices...',
      de: 'Oder Sie können aus Festpreisen wählen...',
      ru: 'Или вы можете выбрать из фиксированных цен...',
      tr: 'Ya da sabit fiyatlar arasından seçim yapabilirsiniz...',
    },
  }
}
