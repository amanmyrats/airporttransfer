import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SOCIAL_ICONS } from '../../constants/social.constants';
import { CallbackService } from '../../services/callback.service';
import { LanguageService } from '../../services/language.service';

const SUPPORTED_BOOKING_LANGUAGES = ['en', 'de', 'ru', 'tr'] as const;
type LanguageCode = (typeof SUPPORTED_BOOKING_LANGUAGES)[number];
const FALLBACK_LANGUAGE: LanguageCode = 'en';

const BOOKING_TRANSLATIONS = {
  successTitle: {
    en: 'Reservation Request Received!',
    de: 'Reservierungsanfrage erhalten!',
    ru: 'Запрос на бронирование получен!',
    tr: 'Rezervasyon Talebiniz Alındı!',
  },
  reservationIntro: {
    en: 'Thank you for your reservation. Once approved, we will notify you via your preferred contact method: <strong>Email, WhatsApp, or Telegram</strong>. Please ensure your contact details are correct.',
    de: 'Vielen Dank für Ihre Reservierung. Sobald sie genehmigt ist, benachrichtigen wir Sie über Ihre bevorzugte Kontaktmethode: <strong>E-Mail, WhatsApp oder Telegram</strong>. Bitte stellen Sie sicher, dass Ihre Kontaktdaten korrekt sind.',
    ru: 'Спасибо за ваше бронирование. После утверждения мы уведомим вас через предпочтительный способ связи: <strong>Email, WhatsApp или Telegram</strong>. Пожалуйста, убедитесь, что ваши контактные данные указаны правильно.',
    tr: 'Rezervasyonunuz için teşekkür ederiz. Onaylandıktan sonra, tercih ettiğiniz iletişim yöntemi ile size bildireceğiz: <strong>Email, WhatsApp veya Telegram</strong>. Lütfen iletişim bilgilerinizin doğru olduğundan emin olun.',
  },
  reservationFollowUp: {
    en: 'If you realize your contact details are incorrect, please reach out to us immediately using any of the contact options below.',
    de: 'Falls Sie feststellen, dass Ihre Kontaktdaten falsch sind, kontaktieren Sie uns bitte sofort über eine der unten stehenden Kontaktmöglichkeiten.',
    ru: 'Если вы обнаружите, что ваши контактные данные указаны неверно, свяжитесь с нами немедленно, используя любой из ниже перечисленных способов.',
    tr: 'İletişim bilgilerinizin yanlış olduğunu fark ederseniz, lütfen aşağıdaki iletişim seçeneklerinden herhangi birini kullanarak hemen bizimle iletişime geçin.',
  },
  contactHeading: {
    en: 'Contact Us',
    de: 'Kontaktieren Sie uns',
    ru: 'Свяжитесь с нами',
    tr: 'Bize Ulaşın',
  },
  contactLabelWhatsapp: {
    en: 'WhatsApp',
    de: 'WhatsApp',
    ru: 'WhatsApp',
    tr: 'WhatsApp',
  },
  contactLabelTelegram: {
    en: 'Telegram',
    de: 'Telegram',
    ru: 'Telegram',
    tr: 'Telegram',
  },
  contactLabelPhone: {
    en: 'Phone',
    de: 'Telefon',
    ru: 'Телефон',
    tr: 'Telefon',
  },
  contactLabelEmail: {
    en: 'Email',
    de: 'Email',
    ru: 'Email',
    tr: 'Email',
  },
  contactLabelAddress: {
    en: 'Office Address',
    de: 'Büroadresse',
    ru: 'Адрес офиса',
    tr: 'Ofis Adresi',
  },
  homeButton: {
    en: 'Back to Home',
    de: 'Zurück zur Startseite',
    ru: 'Вернуться на главную',
    tr: 'Ana Sayfaya Dön',
  },
  nextCheckoutButton: {
    en: 'See payment options',
    de: 'Zahlungsoptionen anzeigen',
    ru: 'Посмотреть варианты оплаты',
    tr: 'Ödeme seçeneklerini gör',
  },
  nextDashboardButton: {
    en: 'Open my dashboard',
    de: 'Zum Kundenbereich',
    ru: 'Перейти в личный кабинет',
    tr: 'Panelime git',
  },
  nextDetailsButton: {
    en: 'See booking details',
    de: 'Buchungsdetails anzeigen',
    ru: 'Смотреть детали бронирования',
    tr: 'Rezervasyon detaylarını gör',
  },
  nextCopyLabel: {
    en: 'Copy booking number',
    de: 'Buchungsnummer kopieren',
    ru: 'Скопировать номер брони',
    tr: 'Rezervasyon numarasını kopyala',
  },
  nextCopiedLabel: {
    en: 'Copied!',
    de: 'Kopiert!',
    ru: 'Скопировано!',
    tr: 'Kopyalandı!',
  },
  metaTitle: {
    en: '24/7 Private Airport Transfer Completed',
    de: '24/7 Privater Flughafentransfer abgeschlossen',
    ru: '24/7 Частный трансфер из аэропорта завершен',
    tr: '7/24 Özel Havalimanı Transferi Tamamlandı',
  },
  metaDescription: {
    en: 'Affordable 24/7 Private transfers from Istanbul Sabiha Gökçen Airport. Reliable transportation to your destination.',
    de: 'Erschwingliche 24/7 private Transfers vom Flughafen Istanbul Sabiha Gökçen. Zuverlässiger Transport zu Ihrem Ziel.',
    ru: 'Доступные 24/7 частные трансферы из аэропорта Стамбула Сабиха Гёкчен. Надежный транспорт до вашего места назначения.',
    tr: 'İstanbul Sabiha Gökçen Havalimanı\'ndan uygun fiyatlı 7/24 özel transferler. Hedefinize güvenilir ulaşım.',
  },
} as const;

type BookingTranslationKey = keyof typeof BOOKING_TRANSLATIONS;

interface BookingPageCopy {
  successTitle: string;
  reservationIntro: string;
  reservationFollowUp: string;
  contactHeading: string;
  contactLabels: {
    whatsapp: string;
    telegram: string;
    phone: string;
    email: string;
    address: string;
  };
  homeButton: string;
  nextSteps: {
    checkoutButton: string;
    dashboardButton: string;
    detailsButton: string;
    copyLabel: string;
    copiedLabel: string;
  };
}

@Component({
  selector: 'app-booking-received',
  imports: [
    CommonModule,
    SuperHeaderComponent, 
    NavbarComponent, 
    FooterComponent, 
  ],
  templateUrl: './booking-received.component.html',
  styleUrl: './booking-received.component.scss'
})
export class BookingReceivedComponent implements OnInit {
  navBarMenu: any = NAVBAR_MENU;
  socialIcons: any = SOCIAL_ICONS;
  currentLanguage = { code: 'en', name: 'English', flag: 'flags/gb.svg' };
  private readonly isLocalhost =
    typeof window !== 'undefined' && window.location.hostname.includes('localhost');
  private readonly isDevEnvironment =
    typeof window !== 'undefined' && window.location.hostname.includes('dev.airporttransferhub.com');
  checkoutLinks: Array<{ label: string; commands: any[]; reference: string; id?: number }> = [];
  dashboardCommands: any[] | null = null;
  hasNextActions = false;
  protected pageCopy: BookingPageCopy = this.buildPageCopy(FALLBACK_LANGUAGE);
  private readonly fallbackLanguage: LanguageCode = FALLBACK_LANGUAGE;
  private pendingReservationRefs: Array<{ reference: string; id?: number }> = [];
  copiedReference = signal<string | null>(null);
  private buttonNavigationKey: string | null = null;
    
  constructor(
    private route: ActivatedRoute, 
    private title: Title, 
    private meta: Meta, 
    private router: Router, 
    private callbackService: CallbackService, 
    private languageService: LanguageService,
  ) {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state) {
        console.log('One Way Info:', navigation.extras.state['oneWayInfo']);
        console.log('Return Info:', navigation.extras.state['returnInfo']);
        const oneWaydata = {
          order: {
            number: navigation.extras.state['oneWayInfo']['number'],
            status: navigation.extras.state['oneWayInfo']['status'],
          }
        }
        console.log('One Way Data:', oneWaydata);

        if (!this.isLocalhost) {
          if (this.isDevEnvironment) {
            this.callbackService.TtAthNewOrderCallback(
              oneWaydata, 
              this.isDevEnvironment
            ).subscribe({
              next: data => {
                console.log('Dev New Order Callback:', data);
              },
              error: error => {
                console.error('Dev New Order Callback Error:', error);
              }
            });
          } else {
            this.callbackService.TtAthNewOrderCallback(oneWaydata).subscribe({
              next: data => {
                console.log('New Order Callback:', data);
              },
              error: error => {
                console.error('New Order Callback Error:', error);
              }
            });
          }
        }

        // If there is a return reservation, send a callback for it as well
        const return_number = navigation.extras.state['returnInfo']['number'];
        if (return_number) {
          const return_data = {
            order: {
              number: return_number,
              status: navigation.extras.state['returnInfo']['status'],
            }
          }
          console.log('Return Data:', return_data);
          if (!this.isLocalhost) {
            if (this.isDevEnvironment) {
              this.callbackService.TtAthNewOrderCallback(
                return_data, 
                this.isDevEnvironment
              ).subscribe({
                next: data => {
                  console.log('Dev New Return Order Callback:', data);
                },
                error: error => {
                  console.error('Dev New Return Order Callback Error:', error);
                }
              });
            } else {

              this.callbackService.TtAthNewOrderCallback(return_data).subscribe({
                next: data => {
                  console.log('New Return Order Callback:', data);
                },
                error: error => {
                  console.error('New Return Order Callback Error:', error);
                }
              });
            }
          }
        }
        this.collectReservationRefs(navigation.extras.state);
      }
  }
  
  ngOnInit(): void {
    const languageCode = this.normalizeLanguage(this.route.snapshot.data['language']);
    this.currentLanguage.code = languageCode;
    this.pageCopy = this.buildPageCopy(languageCode);
    this.initializeNavigationOptions();
    this.setMetaTags(languageCode);
  }

  setMetaTags(langCode: LanguageCode): void {
    this.title.setTitle(this.translate('metaTitle', langCode));
    this.meta.updateTag({ name: 'description', content: this.translate('metaDescription', langCode) });
  }

  private collectReservationRefs(state: any): void {
    const references = new Map<string, number | undefined>();
    const addRef = (payload: any) => {
      if (!payload) {
        return;
      }
      const number = (payload['number'] ?? '').toString().trim();
      const id = typeof payload['id'] === 'number' ? payload['id'] : undefined;
      if (number.length > 0) {
        references.set(number, id);
      }
    };
    addRef(state?.['oneWayInfo']);
    addRef(state?.['returnInfo']);
    this.pendingReservationRefs = Array.from(references.entries()).map(([reference, id]) => ({
      reference,
      id,
    }));
  }

  private initializeNavigationOptions(): void {
    const langCode = this.currentLanguage.code;
    this.dashboardCommands = this.languageService.commandsWithLang(langCode, 'account', 'reservations');
    this.checkoutLinks = this.pendingReservationRefs.map(entry => ({
      label: this.pageCopy.nextSteps.checkoutButton,
      commands: this.languageService.commandsWithLang(langCode, 'checkout', entry.reference),
      reference: entry.reference,
      id: entry.id,
    }));
    this.hasNextActions = this.checkoutLinks.length > 0 || !!this.dashboardCommands;
  }

  reservationDetailCommands(reference: string, id?: number): any[] {
    const langCode = this.currentLanguage.code;
    if (typeof id === 'number') {
      return this.languageService.commandsWithLang(langCode, 'account', 'reservations', String(id));
    }
    return this.languageService.commandsWithLang(langCode, 'account', 'reservations');
  }

  openCheckoutLink(checkout: { commands: any[]; reference: string; id?: number }, event?: Event): void {
    this.navigateWithButtonLoading(checkout.commands, event, 'checkout', checkout.reference);
  }

  openDashboard(event?: Event): void {
    if (!this.dashboardCommands) {
      return;
    }
    this.navigateWithButtonLoading(this.dashboardCommands, event, 'dashboard', 'main');
  }

  openDetails(checkout: { reference: string; id?: number }, event?: Event): void {
    this.navigateWithButtonLoading(
      this.reservationDetailCommands(checkout.reference, checkout.id),
      event,
      'details',
      checkout.id ?? checkout.reference,
    );
  }

  openHome(event?: Event): void {
    this.navigateWithButtonLoading(['/' ], event, 'home', 'root');
  }

  copyReference(reference: string): void {
    if (!reference) {
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(reference)
        .then(() => this.showCopied(reference))
        .catch(() => this.showCopied(reference));
    } else {
      this.showCopied(reference);
    }
  }

  isButtonLoading(section: string, id: string | number | null | undefined): boolean {
    const key = this.buildButtonKey(section, id);
    return Boolean(key && key === this.buttonNavigationKey);
  }

  private navigateWithButtonLoading(
    commands: any[] | null,
    event: Event | undefined,
    section: string,
    id: string | number | null | undefined,
  ): void {
    if (!commands?.length) {
      return;
    }
    const key = this.buildButtonKey(section, id);
    if (!key) {
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }
    if (this.buttonNavigationKey) {
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }
    event?.preventDefault();
    event?.stopPropagation();
    this.buttonNavigationKey = key;
    this.router.navigate(commands).catch(() => this.resetButtonNavigation());
  }

  private buildButtonKey(section: string, id: string | number | null | undefined): string | null {
    if (id === null || id === undefined) {
      return null;
    }
    const normalized = String(id).trim();
    if (!normalized) {
      return null;
    }
    return `${section}:${normalized}`;
  }

  private resetButtonNavigation(): void {
    this.buttonNavigationKey = null;
  }

  private showCopied(reference: string): void {
    this.copiedReference.set(reference);
    setTimeout(() => this.copiedReference.set(null), 2000);
  }

  private buildPageCopy(lang: LanguageCode): BookingPageCopy {
    return {
      successTitle: this.translate('successTitle', lang),
      reservationIntro: this.translate('reservationIntro', lang),
      reservationFollowUp: this.translate('reservationFollowUp', lang),
      contactHeading: this.translate('contactHeading', lang),
      contactLabels: {
        whatsapp: this.translate('contactLabelWhatsapp', lang),
        telegram: this.translate('contactLabelTelegram', lang),
        phone: this.translate('contactLabelPhone', lang),
        email: this.translate('contactLabelEmail', lang),
        address: this.translate('contactLabelAddress', lang),
      },
      homeButton: this.translate('homeButton', lang),
      nextSteps: {
        checkoutButton: this.translate('nextCheckoutButton', lang),
        dashboardButton: this.translate('nextDashboardButton', lang),
        detailsButton: this.translate('nextDetailsButton', lang),
        copyLabel: this.translate('nextCopyLabel', lang),
        copiedLabel: this.translate('nextCopiedLabel', lang),
      },
    };
  }

  private translate(key: BookingTranslationKey, lang: LanguageCode): string {
    const entry = BOOKING_TRANSLATIONS[key];
    return entry[lang] ?? entry[this.fallbackLanguage];
  }

  private normalizeLanguage(code?: string | null): LanguageCode {
    if (code && SUPPORTED_BOOKING_LANGUAGES.includes(code as LanguageCode)) {
      return code as LanguageCode;
    }
    return this.fallbackLanguage;
  }
}
