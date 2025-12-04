import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { PaymentMethod, PaymentMethodDto } from '../../models/payment.models';
import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '../../../constants/language.contants';

interface PaymentMethodSelectCopy {
  heading: string;
  labels: {
    CARD: string;
    BANK_TRANSFER: string;
    CASH: string;
    RUB_PHONE_TRANSFER: string;
  };
}

const FALLBACK_LANGUAGE: LanguageCode = SUPPORTED_LANGUAGE_CODES[0]!;
const METHOD_SELECT_TRANSLATIONS = {
  heading: {
    en: 'Select a payment option',
    de: 'Zahlungsart auswählen',
    ru: 'Выберите способ оплаты',
    tr: 'Bir ödeme yöntemi seçin',
  },
  labelCARD: {
    en: 'Pay with Card',
    de: 'Mit Karte bezahlen',
    ru: 'Оплата картой',
    tr: 'Kart ile öde',
  },
  labelBANK_TRANSFER: {
    en: 'Bank Transfer',
    de: 'Banküberweisung',
    ru: 'Банковский перевод',
    tr: 'Banka havalesi',
  },
  labelCASH: {
    en: 'Cash on Delivery',
    de: 'Bar bei Übergabe',
    ru: 'Наличные при встрече',
    tr: 'Teslimatta nakit',
  },
  labelRUB_PHONE_TRANSFER: {
    en: 'Russian Phone Transfer',
    de: 'Russische Telefonüberweisung',
    ru: 'Перевод на российский телефон',
    tr: 'Rus telefon transferi',
  },
} as const;
type TranslationKey = keyof typeof METHOD_SELECT_TRANSLATIONS;

@Component({
  selector: 'app-payment-method-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method-select.component.html',
  styleUrls: ['./payment-method-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodSelectComponent implements OnInit, OnChanges {
  @Input({ required: true }) methods: PaymentMethodDto[] = [];
  @Input() selected: PaymentMethod | null = null;
  @Input() methodDetails: Partial<Record<PaymentMethod, string>> | null = null;
  @Input() languageCode: string | null = FALLBACK_LANGUAGE;
  @Output() methodSelected = new EventEmitter<PaymentMethod>();
  protected copy: PaymentMethodSelectCopy = this.buildCopy(FALLBACK_LANGUAGE);
  private readonly fallbackLanguage: LanguageCode = FALLBACK_LANGUAGE;

  ngOnInit() {
    // For testing purposes remove card payment method from the list
    this.methods = this.methods.filter(method => method.code !== 'CARD');
    this.setCopy(this.languageCode);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['languageCode'] && !changes['languageCode'].isFirstChange()) {
      this.setCopy(changes['languageCode'].currentValue);
    }
  }

  protected trackByMethod = (_: number, item: PaymentMethodDto) => item.code;

  onSelect(method: PaymentMethod) {
    this.methodSelected.emit(method);
  }

  protected labelFor(method: PaymentMethod, fallback?: string | null): string {
    return this.copy.labels[method] ?? fallback ?? method;
  }

  protected detailFor(method: PaymentMethodDto): string | null {
    const override = this.methodDetails?.[method.code];
    if (override) {
      return override;
    }
    if (method.supportedCurrencies?.length) {
      return method.supportedCurrencies.join(', ');
    }
    return null;
  }
  private setCopy(lang?: string | null): void {
    const normalized = this.normalizeLanguage(lang);
    this.copy = this.buildCopy(normalized);
  }

  private buildCopy(lang: LanguageCode): PaymentMethodSelectCopy {
    return {
      heading: this.translate('heading', lang),
      labels: {
        CARD: this.translate('labelCARD', lang),
        BANK_TRANSFER: this.translate('labelBANK_TRANSFER', lang),
        CASH: this.translate('labelCASH', lang),
        RUB_PHONE_TRANSFER: this.translate('labelRUB_PHONE_TRANSFER', lang),
      },
    };
  }

  private translate(key: TranslationKey, lang: LanguageCode): string {
    const entry = METHOD_SELECT_TRANSLATIONS[key];
    return entry[lang] ?? entry[this.fallbackLanguage];
  }

  private normalizeLanguage(code?: string | null): LanguageCode {
    if (code && SUPPORTED_LANGUAGE_CODES.includes(code as LanguageCode)) {
      return code as LanguageCode;
    }
    return this.fallbackLanguage;
  }
}
