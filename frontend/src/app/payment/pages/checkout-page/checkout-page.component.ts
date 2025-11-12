import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentIntentStore } from '../../services/payment-intent.store';
import { CheckoutStep, IntentStatus, PaymentIntentDto, PaymentMethod } from '../../models/payment.models';
import { PaymentMethodSelectComponent } from '../../components/payment-method-select/payment-method-select.component';
import { OfflineInstructionsComponent } from '../../components/offline-instructions/offline-instructions.component';
import { UploadReceiptComponent } from '../../components/upload-receipt/upload-receipt.component';
import { PaymentButtonComponent } from '../../components/payment-button/payment-button.component';
import { intentIsFinal, isCardMethod, isOfflineMethod } from '../../utils/payment-utils';
import { majorToMinor, formatMinor, minorToMajor } from '../../utils/money.util';
import { CurrencyService } from '../../../services/currency.service';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

const SUPPORTED_CHECKOUT_LANGUAGES = ['en', 'de', 'ru', 'tr'] as const;
type LanguageCode = (typeof SUPPORTED_CHECKOUT_LANGUAGES)[number];
const FALLBACK_LANGUAGE: LanguageCode = 'en';

const CHECKOUT_TRANSLATIONS = {
  summaryTitle: {
    en: 'Checkout',
    de: 'Bezahlung',
    ru: 'Оплата',
    tr: 'Ödeme',
  },
  bookingReferenceLabel: {
    en: 'Booking',
    de: 'Buchung',
    ru: 'Бронирование',
    tr: 'Rezervasyon',
  },
  summaryAriaLabel: {
    en: 'Payment overview',
    de: 'Zahlungsübersicht',
    ru: 'Сводка по оплате',
    tr: 'Ödeme özeti',
  },
  summaryTotalLabel: {
    en: 'Total',
    de: 'Gesamt',
    ru: 'Итого',
    tr: 'Toplam',
  },
  summaryPaidLabel: {
    en: 'Paid',
    de: 'Bezahlt',
    ru: 'Оплачено',
    tr: 'Ödendi',
  },
  summaryDueLabel: {
    en: 'Due',
    de: 'Offen',
    ru: 'К оплате',
    tr: 'Kalan',
  },
  summaryProcessingLabel: {
    en: 'Processing',
    de: 'In Bearbeitung',
    ru: 'Обработка',
    tr: 'İşlemde',
  },
  summaryCurrencyNotePrefix: {
    en: 'Booking currency',
    de: 'Buchungswährung',
    ru: 'Валюта бронирования',
    tr: 'Rezervasyon para birimi',
  },
  summaryCurrencyNoteSuffix: {
    en: 'Payment processed in',
    de: 'Zahlung erfolgt in',
    ru: 'Оплата производится в',
    tr: 'Ödeme şu para biriminde alınır',
  },
  stepperMethod: {
    en: '1. Select method',
    de: '1. Zahlungsmethode wählen',
    ru: '1. Выберите способ',
    tr: '1. Yöntem seç',
  },
  stepperDetails: {
    en: '2. Provide details',
    de: '2. Angaben machen',
    ru: '2. Укажите данные',
    tr: '2. Bilgileri gir',
  },
  stepperProcessing: {
    en: '3. Processing',
    de: '3. Verarbeitung',
    ru: '3. Обработка',
    tr: '3. İşleniyor',
  },
  stepperResult: {
    en: '4. Result',
    de: '4. Ergebnis',
    ru: '4. Результат',
    tr: '4. Sonuç',
  },
  conversionPrefix: {
    en: 'RUB methods charge approximately',
    de: 'RUB-Zahlungen werden mit etwa',
    ru: 'Платежи в RUB списываются примерно на',
    tr: 'RUB yöntemleri yaklaşık',
  },
  conversionMiddle: {
    en: '(converted from',
    de: '(umgerechnet von',
    ru: '(конвертировано из',
    tr: '(bugünkü kurla',
  },
  conversionSuffix: {
    en: "at today's rate).",
    de: 'zum heutigen Kurs).',
    ru: 'по сегодняшнему курсу).',
    tr: 'para biriminden çevrilir.)',
  },
  errorTryAnother: {
    en: 'Try another method',
    de: 'Andere Methode wählen',
    ru: 'Выбрать другой способ',
    tr: 'Başka bir yöntem dene',
  },
  spinnerLabel: {
    en: 'Processing...',
    de: 'Wird verarbeitet...',
    ru: 'Выполняется...',
    tr: 'İşleniyor...',
  },
  resultSuccessTitle: {
    en: 'Payment succeeded',
    de: 'Zahlung erfolgreich',
    ru: 'Платеж успешно выполнен',
    tr: 'Ödeme başarılı',
  },
  resultDefaultTitle: {
    en: 'Payment update',
    de: 'Zahlungsaktualisierung',
    ru: 'Статус платежа',
    tr: 'Ödeme güncellemesi',
  },
  resultSuccessMessage: {
    en: 'Thank you! Your reservation is now paid.',
    de: 'Vielen Dank! Ihre Reservierung ist nun bezahlt.',
    ru: 'Спасибо! Ваше бронирование оплачено.',
    tr: 'Teşekkürler! Rezervasyonunuz ödendi.',
  },
  resultFailedMessage: {
    en: 'Payment failed. Please try another method.',
    de: 'Zahlung fehlgeschlagen. Bitte versuchen Sie eine andere Methode.',
    ru: 'Платеж не выполнен. Пожалуйста, попробуйте другой способ.',
    tr: 'Ödeme başarısız. Lütfen başka bir yöntem deneyin.',
  },
  resultFallbackPrefix: {
    en: 'Payment status:',
    de: 'Zahlungsstatus:',
    ru: 'Статус платежа:',
    tr: 'Ödeme durumu:',
  },
  resultViewButton: {
    en: 'View result',
    de: 'Ergebnis anzeigen',
    ru: 'Показать результат',
    tr: 'Sonucu görüntüle',
  },
  cashTitle: {
    en: 'Pay on arrival',
    de: 'Bei Ankunft zahlen',
    ru: 'Оплата при встрече',
    tr: 'Varışta öde',
  },
  cashPreparePrefix: {
    en: 'Please prepare',
    de: 'Bitte bereiten Sie',
    ru: 'Пожалуйста, подготовьте',
    tr: 'Lütfen',
  },
  cashPrepareMid: {
    en: 'and provide booking reference',
    de: 'vor und nennen Sie die Buchungsnummer',
    ru: 'и сообщите номер бронирования',
    tr: 'hazırlayın ve rezervasyon kodunu',
  },
  cashPrepareSuffix: {
    en: 'to the driver.',
    de: 'dem Fahrer.',
    ru: 'водителю.',
    tr: 'şoföre söyleyin.',
  },
  cashConfirmButton: {
    en: 'Confirm cash reservation',
    de: 'Barzahlung bestätigen',
    ru: 'Подтвердить оплату наличными',
    tr: 'Nakit rezervasyonu onayla',
  },
  cashChangeMethod: {
    en: 'Or select another method',
    de: 'Oder andere Methode wählen',
    ru: 'Или выбрать другой способ',
    tr: 'Ya da başka bir yöntem seç',
  },
  cashIntentNote: {
    en: 'You will still hand the cash to the driver; this button just confirms your intent.',
    de: 'Sie übergeben das Geld weiterhin dem Fahrer; dieser Button bestätigt nur Ihre Absicht.',
    ru: 'Деньги вы все равно передадите водителю; кнопка только подтверждает ваше намерение.',
    tr: 'Parayı yine şoföre vereceksiniz; bu buton yalnızca niyetinizi onaylar.',
  },
  cashPendingNote: {
    en: 'Your cash intent is in progress. You will pay cash to the driver, but if you change your mind you can always choose another method.',
    de: 'Ihre Barzahlungsanfrage wird bearbeitet. Sie zahlen beim Fahrer, können aber jederzeit eine andere Methode wählen.',
    ru: 'Запрос на оплату наличными обрабатывается. Вы можете сменить способ в любой момент.',
    tr: 'Nakit isteğiniz işleniyor. Fikriniz değişirse her zaman başka bir yöntem seçebilirsiniz.',
  },
  offlineUploadRequired: {
    en: 'Please attach your transfer receipt before continuing.',
    de: 'Bitte laden Sie vor dem Fortfahren einen Zahlungsbeleg hoch.',
    ru: 'Пожалуйста, прикрепите квитанцию до продолжения.',
    tr: 'Lütfen devam etmeden önce dekontu ekleyin.',
  },
  offlineUploadSuccess: {
    en: 'Receipt uploaded successfully. We will review it shortly.',
    de: 'Beleg erfolgreich hochgeladen. Wir prüfen ihn in Kürze.',
    ru: 'Квитанция загружена. Мы скоро ее проверим.',
    tr: 'Dekont yüklendi. Kısa süre içinde inceleyeceğiz.',
  },
  intentHistoryTitle: {
    en: 'Recent payment activity',
    de: 'Letzte Zahlungsaktivitäten',
    ru: 'Последние операции оплаты',
    tr: 'Son ödeme hareketleri',
  },
  intentHistoryAttemptedLabel: {
    en: 'Attempted:',
    de: 'Versuch:',
    ru: 'Попытка:',
    tr: 'Deneme:',
  },
  intentHistoryPaidLabel: {
    en: 'Paid:',
    de: 'Bezahlt:',
    ru: 'Оплачено:',
    tr: 'Ödendi:',
  },
  intentHistoryDueLabel: {
    en: 'Due:',
    de: 'Offen:',
    ru: 'К оплате:',
    tr: 'Kalan:',
  },
  intentHistorySuccessSummary: {
    en: 'Payment received. View details',
    de: 'Zahlung eingegangen. Details anzeigen',
    ru: 'Платеж получен. Показать детали',
    tr: 'Ödeme alındı. Detayları görüntüle',
  },
  intentHistoryNoPayments: {
    en: 'No payments were recorded for this attempt.',
    de: 'Für diesen Versuch wurden keine Zahlungen registriert.',
    ru: 'Для этой попытки платежи не зарегистрированы.',
    tr: 'Bu deneme için ödeme kaydı yok.',
  },
  intentHistoryFailedTitle: {
    en: 'Payment failed',
    de: 'Zahlung fehlgeschlagen',
    ru: 'Платеж не выполнен',
    tr: 'Ödeme başarısız',
  },
  intentHistoryFailedHelp: {
    en: 'Please try another method or contact support.',
    de: 'Bitte versuchen Sie eine andere Methode oder kontaktieren Sie den Support.',
    ru: 'Попробуйте другой способ или свяжитесь с поддержкой.',
    tr: 'Lütfen başka bir yöntem deneyin veya destekle iletişime geçin.',
  },
  intentHistoryCapturedLabel: {
    en: 'Captured',
    de: 'Verbucht',
    ru: 'Зачислено',
    tr: 'Tahsil tarihi',
  },
  intentHistoryReferenceLabel: {
    en: 'Reference',
    de: 'Referenz',
    ru: 'Референс',
    tr: 'Referans',
  },
  statusLabelSucceeded: {
    en: 'Succeeded',
    de: 'Erfolgreich',
    ru: 'Успешно',
    tr: 'Başarılı',
  },
  statusLabelProcessing: {
    en: 'Processing (reviewing)',
    de: 'In Bearbeitung (wird geprüft)',
    ru: 'Обработка (проверяется)',
    tr: 'İşleniyor (inceleniyor)',
  },
  statusLabelRequiresAction: {
    en: 'Your action needed',
    de: 'Aktion erforderlich',
    ru: 'Требуется действие',
    tr: 'İşlem gerekli',
  },
  statusLabelRequiresPayment: {
    en: 'Waiting for method',
    de: 'Zahlungsmethode benötigt',
    ru: 'Ожидается способ оплаты',
    tr: 'Yöntem bekleniyor',
  },
  statusLabelFailed: {
    en: 'Failed',
    de: 'Fehlgeschlagen',
    ru: 'Неудачно',
    tr: 'Başarısız',
  },
  statusLabelCanceled: {
    en: 'Cancelled',
    de: 'Storniert',
    ru: 'Отменено',
    tr: 'İptal edildi',
  },
  statusHintRequiresAction: {
    en: 'Action required: click to resume this payment and follow the instructions.',
    de: 'Aktion erforderlich: Bitte wählen Sie diese Zahlung erneut und folgen Sie den Anweisungen.',
    ru: 'Требуется действие: снова откройте этот платеж и следуйте инструкциям.',
    tr: 'İşlem gerekli: Bu ödemeyi yeniden açıp talimatları izleyin.',
  },
  statusHintProcessing: {
    en: 'Our team is reviewing this payment. You will be notified once it is approved.',
    de: 'Unser Team prüft diese Zahlung. Sie werden nach der Freigabe benachrichtigt.',
    ru: 'Мы проверяем этот платеж. Вы получите уведомление после подтверждения.',
    tr: 'Ekibimiz bu ödemeyi inceliyor. Onaylandığında haberdar edileceksiniz.',
  },
  methodDetailsApproxPrefix: {
    en: '≈',
    de: '≈',
    ru: '≈',
    tr: '≈',
  },
  methodDetailsApproxSuffix: {
    en: '(charged in RUB)',
    de: '(in RUB abgerechnet)',
    ru: '(списывается в RUB)',
    tr: '(RUB olarak tahsil edilir)',
  },
  methodDetailsChargedInRub: {
    en: 'Charged in RUB',
    de: 'In RUB abgerechnet',
    ru: 'Списание в RUB',
    tr: 'RUB olarak tahsil edilir',
  },
  loadingMessage: {
    en: 'Loading booking details...',
    de: 'Buchungsdetails werden geladen...',
    ru: 'Загружаем данные брони...',
    tr: 'Rezervasyon bilgileri yükleniyor...',
  },
} as const;

type CheckoutTranslationKey = keyof typeof CHECKOUT_TRANSLATIONS;

interface CheckoutPageCopy {
  summaryTitle: string;
  bookingReferenceLabel: string;
  summary: {
    ariaLabel: string;
    total: string;
    paid: string;
    due: string;
    processing: string;
    currencyNotePrefix: string;
    currencyNoteSuffix: string;
  };
  stepper: {
    method: string;
    details: string;
    processing: string;
    result: string;
  };
  conversion: {
    prefix: string;
    middle: string;
    suffix: string;
  };
  error: {
    tryAnother: string;
  };
  spinner: string;
  result: {
    successTitle: string;
    defaultTitle: string;
    successMessage: string;
    failedMessage: string;
    fallbackMessagePrefix: string;
    viewButton: string;
  };
  cash: {
    title: string;
    preparePrefix: string;
    prepareMid: string;
    prepareSuffix: string;
    confirmButton: string;
    changeMethod: string;
    intentNote: string;
    pendingNote: string;
  };
  offline: {
    uploadRequired: string;
    uploadSuccess: string;
  };
  intentHistory: {
    title: string;
    attempted: string;
    paid: string;
    due: string;
    successSummary: string;
    noPayments: string;
    failedTitle: string;
    failedHelp: string;
    capturedLabel: string;
    referenceLabel: string;
  };
  status: {
    labels: {
      succeeded: string;
      processing: string;
      requires_action: string;
      requires_payment_method: string;
      failed: string;
      canceled: string;
    };
    hints: {
      requiresAction: string;
      processing: string;
    };
  };
  methodDetails: {
    approxPrefix: string;
    approxSuffix: string;
    chargedInRub: string;
  };
  loading: string;
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent,
    PaymentMethodSelectComponent,
    OfflineInstructionsComponent,
    UploadReceiptComponent,
    PaymentButtonComponent,
  ],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent implements OnInit {
  private readonly store = inject(PaymentIntentStore);
  private readonly currencyService = inject(CurrencyService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  @ViewChild(UploadReceiptComponent) private uploadReceipt?: UploadReceiptComponent;
  protected currentLanguage = { code: 'en', name: 'English', flag: 'flags/gb.svg' };
  private readonly fallbackLanguage: LanguageCode = FALLBACK_LANGUAGE;
  protected readonly copy = signal<CheckoutPageCopy>(this.buildCopy(FALLBACK_LANGUAGE));

  protected readonly booking = this.store.booking;
  protected readonly methods = this.store.methods;
  protected readonly intent = this.store.intent;
  protected readonly isLoading = this.store.isLoading;
  protected readonly selectedMethod = this.store.selectedMethod;
  protected readonly error = this.store.error;
  protected readonly formattedTotal = this.store.formattedTotal;
  protected readonly step = this.store.step;
  protected readonly dueMinor = this.store.dueMinor;
  protected readonly paidMinor = this.store.paidMinor;
  protected readonly intentHistory = this.store.intentHistory;
  protected readonly receiptSelection = signal<{ file: File | null; note?: string | null }>({ file: null, note: null });

  protected readonly uploadMessage = signal<string | null>(null);
  protected readonly hasOutstandingDue = computed(() => {
    const due = this.dueMinor();
    return typeof due === 'number' && due > 0;
  });

  protected readonly cardPublishableKey = computed(() => {
    const descriptor = this.methods().find(method => method.code === 'CARD');
    const metadata = descriptor?.metadata as Record<string, unknown> | undefined;
    return (metadata?.['publishable_key'] as string) ?? null;
  });

  protected readonly amountSummary = computed(() => {
    const booking = this.booking();
    if (!booking) {
      return null;
    }
    const bookingCurrency = booking.currency_code;
    const paymentCurrency = this.intent()?.currency ?? bookingCurrency;
    const totalMinor = majorToMinor(Number(booking.amount), bookingCurrency);
    const paidMinor = this.paidMinor();
    const dueMinor = this.dueMinor();
    const dueMinorInBooking = (() => {
      if (dueMinor === null) {
        return null;
      }
      if (paymentCurrency === bookingCurrency) {
        return dueMinor;
      }
      const fromCurrency = this.currencyService.getCurrencyByCode(paymentCurrency);
      const toCurrency = this.currencyService.getCurrencyByCode(bookingCurrency);
      if (!fromCurrency || !toCurrency) {
        return dueMinor;
      }
      const dueMajor = minorToMajor(dueMinor, paymentCurrency);
      const convertedMajor = this.currencyService.convert(dueMajor, fromCurrency, toCurrency);
      return majorToMinor(convertedMajor, bookingCurrency);
    })();
    return {
      totalText: formatMinor(totalMinor, bookingCurrency),
      totalCurrency: bookingCurrency,
      paidText: paidMinor ? formatMinor(paidMinor, paymentCurrency) : null,
      paidCurrency: paidMinor ? paymentCurrency : null,
      dueText: dueMinorInBooking !== null ? formatMinor(dueMinorInBooking, bookingCurrency) : null,
      dueCurrency: dueMinorInBooking !== null ? bookingCurrency : null,
      bookingCurrency,
      paymentCurrency,
      hasCurrencyMismatch: bookingCurrency !== paymentCurrency,
    };
  });

  private readonly rubConversion = computed(() => {
    const booking = this.booking();
    const dueMinor = this.dueMinor();
    const sourceCurrency = this.intent()?.currency ?? booking?.currency_code ?? null;
    if (!booking || sourceCurrency === null || sourceCurrency === 'RUB' || dueMinor === null) {
      return null;
    }
    const fromCurrency = this.currencyService.getCurrencyByCode(sourceCurrency);
    const rubCurrency = this.currencyService.getCurrencyByCode('RUB');
    if (!fromCurrency || !rubCurrency) {
      return null;
    }
    const dueMajor = minorToMajor(dueMinor, sourceCurrency);
    const converted = this.currencyService.convert(dueMajor, fromCurrency, rubCurrency);
    return {
      convertedFormatted: formatMinor(majorToMinor(converted, 'RUB'), 'RUB'),
      originalCurrency: sourceCurrency,
    };
  });

  protected readonly rubPreview = computed(() => {
    if (this.selectedMethod() !== 'RUB_PHONE_TRANSFER') {
      return null;
    }
    return this.rubConversion();
  });

  protected readonly methodDetails = computed<Partial<Record<PaymentMethod, string>>>(() => {
    const booking = this.booking();
    if (!booking) {
      return {};
    }
    const details: Partial<Record<PaymentMethod, string>> = {};
    const conversion = this.rubConversion();
    const copy = this.copy();
    details['RUB_PHONE_TRANSFER'] = conversion
      ? `${copy.methodDetails.approxPrefix} ${conversion.convertedFormatted} ${copy.methodDetails.approxSuffix}`
      : copy.methodDetails.chargedInRub;
    return details;
  });

  protected readonly hasProcessingCashIntent = computed(() => {
    if (this.selectedMethod() !== 'CASH') {
      return false;
    }
    const current = this.intent();
    const history = this.intentHistory() ?? [];
    const intents: PaymentIntentDto[] = current ? [current, ...history] : [...history];
    return intents.some(candidate => {
      if (!candidate || candidate.method !== 'CASH') {
        return false;
      }
      return candidate.status === 'processing' && !this.requiresCustomerActionIntent(candidate);
    });
  });

  protected async onMethodSelected(method: PaymentMethod) {
    const booking = this.booking();
    console.log('Method selected:', method);
    if (!booking) {
      return;
    }
    const descriptor = this.methods().find(m => m.code === method);
    // console.log('Method descriptor:', descriptor);
    this.store.setMethod(method);
    // console.log('Method set in store:', this.store.selectedMethod());
    this.uploadMessage.set(null);
    // console.log('Upload message cleared');

    const returnUrl = this.buildReturnUrl(booking.number);
    await this.store.createOrResume(
      booking.number,
      majorToMinor(Number(booking.amount), booking.currency_code),
      booking.currency_code,
      method,
      returnUrl ?? undefined,
      {
        email: booking.passenger_email,
        name: booking.passenger_name ?? undefined,
      },
      descriptor?.metadata ?? undefined,
    );
  }

  protected async onOfflineConfirm() {
    const currentIntent = this.intent();
    if (!currentIntent) {
      return;
    }
    if (this.requiresReceipt(currentIntent.method)) {
      const selection = this.receiptSelection();
      if (!selection.file) {
        this.uploadMessage.set(this.copy().offline.uploadRequired);
        return;
      }
      const uploaded = await this.store.uploadOfflineReceipt(selection.file, selection.note ?? undefined);
      if (!uploaded) {
        return;
      }
      this.uploadMessage.set(this.copy().offline.uploadSuccess);
      this.uploadReceipt?.reset();
      this.receiptSelection.set({ file: null, note: null });
    }
    await this.store.confirm(currentIntent.public_id);
  }

  protected async onCardStatusChange(status: 'succeeded' | 'requires_action' | 'failed') {
    if (status === 'succeeded') {
      const intent = await this.store.refreshIntent();
      if (intent?.status === 'succeeded') {
        await this.navigateToResult(intent.public_id);
      }
    }
  }

  protected async goToResult() {
    const intent = this.intent();
    await this.navigateToResult(intent?.public_id);
  }

  private async navigateToResult(intentId?: string | null) {
    if (!this.route) {
      return;
    }
    await this.router.navigate(['result'], {
      relativeTo: this.route,
      queryParams: intentId ? { intent: intentId } : undefined,
    });
  }

  protected isCard = isCardMethod;
  protected isOffline = isOfflineMethod;
  protected isCash = (method: PaymentMethod | null) => method === 'CASH';
  protected requiresReceipt = (method: PaymentMethod | null) =>
    method === 'BANK_TRANSFER' || method === 'RUB_PHONE_TRANSFER';
  protected intentIsFinal = intentIsFinal;
  protected formatMinor = formatMinor;
  protected trackIntent = (_: number, intent: PaymentIntentDto) => intent.public_id;

  protected buildReturnUrl(bookingRef: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const url = new URL(window.location.href);
    url.pathname = `/checkout/${bookingRef}/three-ds-return`;
    if (this.intent()) {
      url.searchParams.set('intent', this.intent()!.public_id);
    }
    return url.toString();
  }

  protected selectIntentFromHistory(intent: PaymentIntentDto): void {
    this.store.useIntent(intent);
    this.uploadMessage.set(null);
  }

  protected requiresCustomerActionIntent(intent: PaymentIntentDto): boolean {
    return intent.status === 'requires_action' || intent.status === 'requires_payment_method';
  }

  protected showOfflineInstructions(intent: PaymentIntentDto): boolean {
    return this.requiresCustomerActionIntent(intent) || this.shouldForceOfflineInstructions(intent);
  }

  protected offlineInstructionStatus(intent: PaymentIntentDto): IntentStatus {
    return this.shouldForceOfflineInstructions(intent) ? 'requires_action' : intent.status;
  }

  private shouldForceOfflineInstructions(intent: PaymentIntentDto): boolean {
    if (!intent || isCardMethod(intent.method)) {
      return false;
    }
    if (this.requiresCustomerActionIntent(intent)) {
      return false;
    }
    const due = intent.due_minor ?? null;
    const hasOutstanding = due === null || due > 0;
    const hasEvidence = Boolean(intent.offline_receipts?.length || intent.payments?.length);
    return hasOutstanding && !hasEvidence && intent.status === 'processing';
  }

  protected methodLabel(method: PaymentMethod): string {
    return this.methods().find(candidate => candidate.code === method)?.label ?? method;
  }

  protected statusHint(intent: PaymentIntentDto): string | null {
    if (intent.status === 'requires_action') {
      return this.copy().status.hints.requiresAction;
    }
    if (intent.status === 'processing') {
      return this.copy().status.hints.processing;
    }
    return null;
  }

  protected onReceiptSelectionChange(selection: { file: File | null; note?: string | null }): void {
    this.receiptSelection.set(selection);
    this.uploadMessage.set(null);
  }

  protected onSelectAnotherMethod(): void {
    this.store.markStep('method');
    this.receiptSelection.set({ file: null, note: null });
    this.uploadMessage.set(null);
  }

  protected statusLabel(status: PaymentIntentDto['status']): string {
    const labels = this.copy().status.labels;
    if (status in labels) {
      return labels[status as keyof typeof labels];
    }
    return status;
  }

  protected statusClass(status: PaymentIntentDto['status']): 'success' | 'processing' | 'pending' | 'error' {
    switch (status) {
      case 'succeeded':
        return 'success';
      case 'processing':
        return 'processing';
      case 'requires_action':
      case 'requires_payment_method':
        return 'pending';
      default:
        return 'error';
    }
  }

  private readonly stepSequence: CheckoutStep[] = ['method', 'details', 'processing', 'result'];

  protected isStepActive(stepName: CheckoutStep): boolean {
    return this.step() === stepName;
  }

  protected isStepCompleted(stepName: CheckoutStep): boolean {
    const currentIndex = this.stepSequence.indexOf(this.step());
    const targetIndex = this.stepSequence.indexOf(stepName);
    return targetIndex !== -1 && currentIndex !== -1 && targetIndex < currentIndex;
  }

  ngOnInit(): void {
    const languageCode = this.normalizeLanguage(this.resolveLanguageFromRoute());
    this.currentLanguage.code = languageCode;
    this.copy.set(this.buildCopy(languageCode));
  }

  private resolveLanguageFromRoute(): string {
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const language = currentRoute.snapshot.data['language'];
      if (language) {
        return language;
      }
      currentRoute = currentRoute.parent;
    }
    return 'en';
  }

  private buildCopy(lang: LanguageCode): CheckoutPageCopy {
    return {
      summaryTitle: this.translate('summaryTitle', lang),
      bookingReferenceLabel: this.translate('bookingReferenceLabel', lang),
      summary: {
        ariaLabel: this.translate('summaryAriaLabel', lang),
        total: this.translate('summaryTotalLabel', lang),
        paid: this.translate('summaryPaidLabel', lang),
        due: this.translate('summaryDueLabel', lang),
        processing: this.translate('summaryProcessingLabel', lang),
        currencyNotePrefix: this.translate('summaryCurrencyNotePrefix', lang),
        currencyNoteSuffix: this.translate('summaryCurrencyNoteSuffix', lang),
      },
      stepper: {
        method: this.translate('stepperMethod', lang),
        details: this.translate('stepperDetails', lang),
        processing: this.translate('stepperProcessing', lang),
        result: this.translate('stepperResult', lang),
      },
      conversion: {
        prefix: this.translate('conversionPrefix', lang),
        middle: this.translate('conversionMiddle', lang),
        suffix: this.translate('conversionSuffix', lang),
      },
      error: {
        tryAnother: this.translate('errorTryAnother', lang),
      },
      spinner: this.translate('spinnerLabel', lang),
      result: {
        successTitle: this.translate('resultSuccessTitle', lang),
        defaultTitle: this.translate('resultDefaultTitle', lang),
        successMessage: this.translate('resultSuccessMessage', lang),
        failedMessage: this.translate('resultFailedMessage', lang),
        fallbackMessagePrefix: this.translate('resultFallbackPrefix', lang),
        viewButton: this.translate('resultViewButton', lang),
      },
      cash: {
        title: this.translate('cashTitle', lang),
        preparePrefix: this.translate('cashPreparePrefix', lang),
        prepareMid: this.translate('cashPrepareMid', lang),
        prepareSuffix: this.translate('cashPrepareSuffix', lang),
        confirmButton: this.translate('cashConfirmButton', lang),
        changeMethod: this.translate('cashChangeMethod', lang),
        intentNote: this.translate('cashIntentNote', lang),
        pendingNote: this.translate('cashPendingNote', lang),
      },
      offline: {
        uploadRequired: this.translate('offlineUploadRequired', lang),
        uploadSuccess: this.translate('offlineUploadSuccess', lang),
      },
      intentHistory: {
        title: this.translate('intentHistoryTitle', lang),
        attempted: this.translate('intentHistoryAttemptedLabel', lang),
        paid: this.translate('intentHistoryPaidLabel', lang),
        due: this.translate('intentHistoryDueLabel', lang),
        successSummary: this.translate('intentHistorySuccessSummary', lang),
        noPayments: this.translate('intentHistoryNoPayments', lang),
        failedTitle: this.translate('intentHistoryFailedTitle', lang),
        failedHelp: this.translate('intentHistoryFailedHelp', lang),
        capturedLabel: this.translate('intentHistoryCapturedLabel', lang),
        referenceLabel: this.translate('intentHistoryReferenceLabel', lang),
      },
      status: {
        labels: {
          succeeded: this.translate('statusLabelSucceeded', lang),
          processing: this.translate('statusLabelProcessing', lang),
          requires_action: this.translate('statusLabelRequiresAction', lang),
          requires_payment_method: this.translate('statusLabelRequiresPayment', lang),
          failed: this.translate('statusLabelFailed', lang),
          canceled: this.translate('statusLabelCanceled', lang),
        },
        hints: {
          requiresAction: this.translate('statusHintRequiresAction', lang),
          processing: this.translate('statusHintProcessing', lang),
        },
      },
      methodDetails: {
        approxPrefix: this.translate('methodDetailsApproxPrefix', lang),
        approxSuffix: this.translate('methodDetailsApproxSuffix', lang),
        chargedInRub: this.translate('methodDetailsChargedInRub', lang),
      },
      loading: this.translate('loadingMessage', lang),
    };
  }

  private translate(key: CheckoutTranslationKey, lang: LanguageCode): string {
    const entry = CHECKOUT_TRANSLATIONS[key];
    return entry[lang] ?? entry[this.fallbackLanguage];
  }

  private normalizeLanguage(code: string | null | undefined): LanguageCode {
    if (code && SUPPORTED_CHECKOUT_LANGUAGES.includes(code as LanguageCode)) {
      return code as LanguageCode;
    }
    return this.fallbackLanguage;
  }
}
