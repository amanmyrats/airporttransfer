import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { EventEmitter, Output } from '@angular/core';

import { BankTransferInstruction, IntentStatus, PaymentMethod } from '../../models/payment.models';
import { formatMinor } from '../../utils/money.util';

interface OfflineInstructionsCopy {
  detailed: {
    title: string;
    amountPrefix: string;
    amountSuffix: string;
    reference: string;
    phoneNumber: string;
    iban: string;
    accountHolder: string;
    accountName: string;
    bankName: string;
    bank: string;
    expires: string;
    note: string;
    confirmButton: string;
    changeMethod: string;
    reviewing: string;
  };
  generic: {
    title: string;
    amountPrefix: string;
    amountMid: string;
    amountSuffix: string;
    confirmButton: string;
    changeMethod: string;
    reviewing: string;
  };
}

const SUPPORTED_LANGUAGES = ['en', 'de', 'ru', 'tr'] as const;
type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];
const FALLBACK_LANGUAGE: LanguageCode = 'en';
const OFFLINE_TRANSLATIONS = {
  detailedTitle: {
    en: 'Transfer Instructions',
    de: 'Überweisungsanweisungen',
    ru: 'Инструкции по переводу',
    tr: 'Havale talimatları',
  },
  detailedAmountPrefix: {
    en: 'Please transfer',
    de: 'Bitte überweisen Sie',
    ru: 'Пожалуйста, переведите',
    tr: 'Lütfen',
  },
  detailedAmountSuffix: {
    en: 'and reference your booking code.',
    de: 'und geben Sie Ihren Buchungscode an.',
    ru: 'и укажите номер бронирования.',
    tr: 'transfer edip rezervasyon kodunu belirtin.',
  },
  detailedReference: {
    en: 'Reference',
    de: 'Referenz',
    ru: 'Референс',
    tr: 'Referans',
  },
  detailedPhoneNumber: {
    en: 'Phone number',
    de: 'Telefonnummer',
    ru: 'Номер телефона',
    tr: 'Telefon numarası',
  },
  detailedIban: {
    en: 'IBAN',
    de: 'IBAN',
    ru: 'IBAN',
    tr: 'IBAN',
  },
  detailedAccountHolder: {
    en: 'Account holder',
    de: 'Kontoinhaber',
    ru: 'Владелец счета',
    tr: 'Hesap sahibi',
  },
  detailedAccountName: {
    en: 'Account name',
    de: 'Kontoname',
    ru: 'Название счета',
    tr: 'Hesap adı',
  },
  detailedBankName: {
    en: 'Bank name',
    de: 'Bankname',
    ru: 'Название банка',
    tr: 'Banka adı',
  },
  detailedBank: {
    en: 'Bank',
    de: 'Bank',
    ru: 'Банк',
    tr: 'Banka',
  },
  detailedExpires: {
    en: 'Expires',
    de: 'Gültig bis',
    ru: 'Истекает',
    tr: 'Son tarih',
  },
  detailedNote: {
    en: 'Upload your transfer receipt once completed so our team can verify the payment.',
    de: 'Laden Sie nach Abschluss der Überweisung den Beleg hoch, damit wir die Zahlung prüfen können.',
    ru: 'Загрузите квитанцию после перевода, чтобы мы могли подтвердить оплату.',
    tr: 'Ödeme tamamlanınca dekontu yükleyin, böylece ödemeyi doğrulayabilelim.',
  },
  detailedConfirmButton: {
    en: "I've sent the transfer",
    de: 'Ich habe überwiesen',
    ru: 'Я отправил перевод',
    tr: 'Havale yaptım',
  },
  detailedChangeMethod: {
    en: 'Or select another method',
    de: 'Oder andere Methode wählen',
    ru: 'Или выбрать другой способ',
    tr: 'Ya da başka bir yöntem seç',
  },
  detailedReviewing: {
    en: 'We are reviewing your payment.',
    de: 'Wir prüfen Ihre Zahlung.',
    ru: 'Мы проверяем ваш платеж.',
    tr: 'Ödemenizi inceliyoruz.',
  },
  genericTitle: {
    en: 'Payment instructions',
    de: 'Zahlungshinweise',
    ru: 'Инструкции по оплате',
    tr: 'Ödeme talimatları',
  },
  genericAmountPrefix: {
    en: 'Please prepare',
    de: 'Bitte bereiten Sie',
    ru: 'Пожалуйста, подготовьте',
    tr: 'Lütfen',
  },
  genericAmountMid: {
    en: 'and provide booking reference',
    de: 'vor und nennen Sie die Buchungsnummer',
    ru: 'и сообщите номер бронирования',
    tr: 'hazırlayın ve rezervasyon kodunu',
  },
  genericAmountSuffix: {
    en: 'to the driver.',
    de: 'dem Fahrer.',
    ru: 'водителю.',
    tr: 'şoföre söyleyin.',
  },
  genericConfirmButton: {
    en: "I've sent the transfer",
    de: 'Ich habe überwiesen',
    ru: 'Я отправил перевод',
    tr: 'Havale yaptım',
  },
  genericChangeMethod: {
    en: 'Or select another method',
    de: 'Oder andere Methode wählen',
    ru: 'Или выбрать другой способ',
    tr: 'Ya da başka bir yöntem seç',
  },
  genericReviewing: {
    en: 'We are reviewing your payment.',
    de: 'Wir prüfen Ihre Zahlung.',
    ru: 'Мы проверяем ваш платеж.',
    tr: 'Ödemenizi inceliyoruz.',
  },
} as const;
type TranslationKey = keyof typeof OFFLINE_TRANSLATIONS;

@Component({
  selector: 'app-offline-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline-instructions.component.html',
  styleUrls: ['./offline-instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineInstructionsComponent implements OnChanges {
  @Input() instruction: BankTransferInstruction | null = null;
  @Input() amountMinor = 0;
  @Input() currency = 'EUR';
  @Input() bookingRef = '';
  @Input() status: IntentStatus | null = null;
  @Input() actionDisabled = false;
  @Input() method: PaymentMethod | null = null;
  @Input() languageCode: string | null = 'en';
  @Output() confirmTransfer = new EventEmitter<void>();
  @Output() changeMethod = new EventEmitter<void>();
  protected copy: OfflineInstructionsCopy = this.buildCopy(FALLBACK_LANGUAGE);
  private readonly fallbackLanguage: LanguageCode = FALLBACK_LANGUAGE;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['languageCode']) {
      this.setCopy(changes['languageCode'].currentValue);
    }
  }

  protected formatAmount(): string {
    return formatMinor(this.amountMinor, this.currency);
  }

  protected isRubPhoneTransfer(): boolean {
    return this.method === 'RUB_PHONE_TRANSFER';
  }

  protected phoneValue(details: BankTransferInstruction): string | null {
    return details.phone_number || details.iban || null;
  }

  private setCopy(lang?: string | null): void {
    const normalized = this.normalizeLanguage(lang);
    this.copy = this.buildCopy(normalized);
  }

  private buildCopy(lang: LanguageCode): OfflineInstructionsCopy {
    return {
      detailed: {
        title: this.translate('detailedTitle', lang),
        amountPrefix: this.translate('detailedAmountPrefix', lang),
        amountSuffix: this.translate('detailedAmountSuffix', lang),
        reference: this.translate('detailedReference', lang),
        phoneNumber: this.translate('detailedPhoneNumber', lang),
        iban: this.translate('detailedIban', lang),
        accountHolder: this.translate('detailedAccountHolder', lang),
        accountName: this.translate('detailedAccountName', lang),
        bankName: this.translate('detailedBankName', lang),
        bank: this.translate('detailedBank', lang),
        expires: this.translate('detailedExpires', lang),
        note: this.translate('detailedNote', lang),
        confirmButton: this.translate('detailedConfirmButton', lang),
        changeMethod: this.translate('detailedChangeMethod', lang),
        reviewing: this.translate('detailedReviewing', lang),
      },
      generic: {
        title: this.translate('genericTitle', lang),
        amountPrefix: this.translate('genericAmountPrefix', lang),
        amountMid: this.translate('genericAmountMid', lang),
        amountSuffix: this.translate('genericAmountSuffix', lang),
        confirmButton: this.translate('genericConfirmButton', lang),
        changeMethod: this.translate('genericChangeMethod', lang),
        reviewing: this.translate('genericReviewing', lang),
      },
    };
  }

  private translate(key: TranslationKey, lang: LanguageCode): string {
    const entry = OFFLINE_TRANSLATIONS[key];
    return entry[lang] ?? entry[this.fallbackLanguage];
  }

  private normalizeLanguage(code?: string | null): LanguageCode {
    if (code && SUPPORTED_LANGUAGES.includes(code as LanguageCode)) {
      return code as LanguageCode;
    }
    return this.fallbackLanguage;
  }
}
