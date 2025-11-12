import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

interface PaymentButtonCopy {
  processingLabel: string;
  payNowLabel: string;
  unavailable: string;
  messages: {
    failed: string;
    success: string;
    requiresAction: string;
    processing: string;
    stripeInit: string;
  };
}

const SUPPORTED_LANGUAGES = ['en', 'de', 'ru', 'tr'] as const;
type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];
const FALLBACK_LANGUAGE: LanguageCode = 'en';
const PAYMENT_BUTTON_TRANSLATIONS = {
  processingLabel: {
    en: 'Processing...',
    de: 'Wird verarbeitet...',
    ru: 'Выполняется...',
    tr: 'İşleniyor...',
  },
  payNowLabel: {
    en: 'Pay now',
    de: 'Jetzt bezahlen',
    ru: 'Оплатить',
    tr: 'Şimdi öde',
  },
  unavailable: {
    en: 'Card payments are not available at the moment.',
    de: 'Kartenzahlungen sind derzeit nicht verfügbar.',
    ru: 'Оплата картой сейчас недоступна.',
    tr: 'Kart ödemeleri şu anda kullanılamıyor.',
  },
  messageFailed: {
    en: 'Payment failed. Please try again.',
    de: 'Zahlung fehlgeschlagen. Bitte erneut versuchen.',
    ru: 'Платеж не выполнен. Попробуйте еще раз.',
    tr: 'Ödeme başarısız. Lütfen tekrar deneyin.',
  },
  messageSuccess: {
    en: 'Payment succeeded!',
    de: 'Zahlung erfolgreich!',
    ru: 'Платеж прошел успешно!',
    tr: 'Ödeme başarılı!',
  },
  messageRequiresAction: {
    en: 'Additional authentication required.',
    de: 'Zusätzliche Authentifizierung erforderlich.',
    ru: 'Требуется дополнительная аутентификация.',
    tr: 'Ek kimlik doğrulaması gerekiyor.',
  },
  messageProcessing: {
    en: 'Payment processing. Please wait.',
    de: 'Zahlung wird verarbeitet. Bitte warten.',
    ru: 'Платеж обрабатывается. Пожалуйста, подождите.',
    tr: 'Ödeme işleniyor. Lütfen bekleyin.',
  },
  messageStripeInit: {
    en: 'Unable to initialise Stripe.',
    de: 'Stripe konnte nicht initialisiert werden.',
    ru: 'Не удалось инициализировать Stripe.',
    tr: 'Stripe başlatılamadı.',
  },
} as const;
type TranslationKey = keyof typeof PAYMENT_BUTTON_TRANSLATIONS;

@Component({
  selector: 'app-payment-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-button.component.html',
  styleUrls: ['./payment-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentButtonComponent implements OnChanges, OnDestroy {
  @Input() clientSecret: string | null = null;
  @Input() publishableKey: string | null = null;
  @Input() returnUrl: string | null = null;
  @Input() bookingRef: string | null = null;
  @Input() intentId: string | null = null;
  @Input() languageCode: string | null = 'en';
  @Output() statusChange = new EventEmitter<'succeeded' | 'requires_action' | 'failed'>();

  processing = false;
  message: string | null = null;
  protected copy: PaymentButtonCopy = this.buildCopy(FALLBACK_LANGUAGE);
  private readonly fallbackLanguage: LanguageCode = FALLBACK_LANGUAGE;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['languageCode']) {
      this.setCopy(changes['languageCode'].currentValue);
    }
    if ((changes['clientSecret'] || changes['publishableKey']) && this.isBrowser) {
      void this.setupElements();
    }
  }

  ngOnDestroy(): void {
    if (this.elements) {
      this.paymentElement?.destroy();
    }
  }

  async confirm(): Promise<void> {
    if (!this.stripe || !this.elements || this.processing) {
      return;
    }
    this.processing = true;
    this.message = null;
    const result = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url:
          this.returnUrl ?? this.buildReturnUrl(),
      },
      redirect: 'if_required',
    });
    this.processing = false;

    if (result.error) {
      this.message = result.error.message ?? this.copy.messages.failed;
      this.statusChange.emit('failed');
      return;
    }

    const status = result.paymentIntent?.status;
    if (status === 'succeeded') {
      this.statusChange.emit('succeeded');
      this.message = this.copy.messages.success;
    } else if (status === 'requires_action') {
      this.statusChange.emit('requires_action');
      this.message = this.copy.messages.requiresAction;
    } else {
      this.statusChange.emit('failed');
      this.message = this.copy.messages.processing;
    }
  }

  private async setupElements() {
    if (!this.clientSecret || !this.publishableKey) {
      return;
    }
    this.stripe = await loadStripe(this.publishableKey);
    if (!this.stripe) {
      this.message = this.copy.messages.stripeInit;
      return;
    }
    this.elements = this.stripe.elements({
      clientSecret: this.clientSecret,
      appearance: { theme: 'stripe' },
    });
    this.paymentElement?.destroy();
    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount('#payment-element');
  }

  private buildReturnUrl(): string | undefined {
    if (typeof window === 'undefined' || !this.bookingRef || !this.intentId) {
      return undefined;
    }
    const url = new URL(window.location.href);
    url.pathname = `/checkout/${this.bookingRef}/three-ds-return`;
    url.searchParams.set('intent', this.intentId);
    return url.toString();
  }

  private setCopy(lang?: string | null): void {
    const normalized = this.normalizeLanguage(lang);
    this.copy = this.buildCopy(normalized);
  }

  private buildCopy(lang: LanguageCode): PaymentButtonCopy {
    return {
      processingLabel: this.translate('processingLabel', lang),
      payNowLabel: this.translate('payNowLabel', lang),
      unavailable: this.translate('unavailable', lang),
      messages: {
        failed: this.translate('messageFailed', lang),
        success: this.translate('messageSuccess', lang),
        requiresAction: this.translate('messageRequiresAction', lang),
        processing: this.translate('messageProcessing', lang),
        stripeInit: this.translate('messageStripeInit', lang),
      },
    };
  }

  private translate(key: TranslationKey, lang: LanguageCode): string {
    const entry = PAYMENT_BUTTON_TRANSLATIONS[key];
    return entry[lang] ?? entry[this.fallbackLanguage];
  }

  private normalizeLanguage(code?: string | null): LanguageCode {
    if (code && SUPPORTED_LANGUAGES.includes(code as LanguageCode)) {
      return code as LanguageCode;
    }
    return this.fallbackLanguage;
  }
}
