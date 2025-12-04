import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';

import { EventEmitter, Output } from '@angular/core';

import {
  BankTransferInstruction,
  IntentStatus,
  PaymentMethod,
  PaymentBankAccount,
} from '../../models/payment.models';
import { formatMinor } from '../../utils/money.util';
import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '../../../constants/language.contants';

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
    currencyRestriction: string;
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
  copied: string;
  copyPrompt: string;
}

const FALLBACK_LANGUAGE: LanguageCode = SUPPORTED_LANGUAGE_CODES[0]!;
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
  detailedCurrencyRestriction: {
    en: 'Only for {{currency}} transfers',
    de: 'Nur für {{currency}}-Überweisungen',
    ru: 'Только для переводов в {{currency}}',
    tr: 'Yalnızca {{currency}} havaleleri için',
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
  copiedLabel: {
    en: 'Copied',
    de: 'Kopiert',
    ru: 'Скопировано',
    tr: 'Kopyalandı',
  },
  copyPromptLabel: {
    en: 'Click to copy',
    de: 'Zum Kopieren klicken',
    ru: 'Нажмите, чтобы скопировать',
    tr: 'Kopyalamak için tıklayın',
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
  private readonly cdr = inject(ChangeDetectorRef);
  @Input() instruction: BankTransferInstruction | null = null;
  @Input() amountMinor = 0;
  @Input() currency = 'EUR';
  @Input() bookingRef = '';
  @Input() status: IntentStatus | null = null;
  @Input() actionDisabled = false;
  @Input() method: PaymentMethod | null = null;
  @Input() languageCode: string | null = FALLBACK_LANGUAGE;
  @Output() confirmTransfer = new EventEmitter<void>();
  @Output() changeMethod = new EventEmitter<void>();
  protected copy: OfflineInstructionsCopy = this.buildCopy(FALLBACK_LANGUAGE);
  private readonly fallbackLanguage: LanguageCode = FALLBACK_LANGUAGE;
  protected copiedKey: string | null = null;
  private copyResetHandle: ReturnType<typeof setTimeout> | null = null;

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
        currencyRestriction: this.translate('detailedCurrencyRestriction', lang),
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
      copied: this.translate('copiedLabel', lang),
      copyPrompt: this.translate('copyPromptLabel', lang),
    };
  }

  private translate(key: TranslationKey, lang: LanguageCode): string {
    const entry = OFFLINE_TRANSLATIONS[key];
    return entry[lang] ?? entry[this.fallbackLanguage];
  }

  private normalizeLanguage(code?: string | null): LanguageCode {
    if (code && SUPPORTED_LANGUAGE_CODES.includes(code as LanguageCode)) {
      return code as LanguageCode;
    }
    return this.fallbackLanguage;
  }

  protected maskSensitiveValue(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    const trimmed = value.toString().trim();
    if (trimmed.length <= 4) {
      return trimmed;
    }
    const visible = trimmed.slice(0, 4);
    const maskedLength = Math.max(4, trimmed.length - 4);
    return `${visible}${'*'.repeat(maskedLength)}`;
  }

  protected copyValue(value: string | null | undefined, key: string): void {
    if (!value) {
      return;
    }
    const text = value.toString().trim();
    if (!text) {
      return;
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => this.handleCopied(key))
        .catch(error => {
          console.warn('Clipboard API failed, falling back to execCommand copy.', error);
          this.fallbackCopy(text, key);
        });
      return;
    }
    this.fallbackCopy(text, key);
  }

  protected buildCopyKey(
    account: { id?: number | string | null; label?: string | null },
    field: string,
    index: number,
  ): string {
    if (account?.id !== undefined && account?.id !== null) {
      return `${account.id}-${field}`;
    }
    const label = account?.label ? account.label.replace(/\s+/g, '-').toLowerCase() : 'account';
    return `${label}-${index}-${field}`;
  }

  private fallbackCopy(value: string, key: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      this.handleCopied(key);
    } catch (error) {
      console.error('Copy failed', error);
    } finally {
      document.body.removeChild(textarea);
    }
  }

  private handleCopied(key: string): void {
    this.copiedKey = key;
    if (this.copyResetHandle) {
      clearTimeout(this.copyResetHandle);
    }
    this.copyResetHandle = setTimeout(() => {
      this.copiedKey = null;
      this.copyResetHandle = null;
      this.cdr.markForCheck();
    }, 2000);
    this.cdr.markForCheck();
  }

  protected copyLabelFor(key: string | null | undefined): string {
    if (!key) {
      return '';
    }
    return this.copiedKey === key ? this.copy.copied : this.copy.copyPrompt;
  }

  protected copyLabelActiveFor(key: string | null | undefined): boolean {
    return !!key && this.copiedKey === key;
  }

  protected currencyRestrictionNoteFor(account: PaymentBankAccount | null | undefined): string | null {
    const currency = account?.currency?.trim();
    if (!currency) {
      return null;
    }
    const template = this.copy.detailed.currencyRestriction;
    return template.replace('{{currency}}', currency.toUpperCase());
  }
}
