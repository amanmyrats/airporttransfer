import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '../../../constants/language.contants';

interface UploadReceiptCopy {
  chooseLabel: string;
  optionalNote: string;
  placeholder: string;
}

const FALLBACK_LANGUAGE: LanguageCode = SUPPORTED_LANGUAGE_CODES[0]!;
const UPLOAD_TRANSLATIONS = {
  chooseLabel: {
    en: 'Select receipt (PDF/JPG/PNG)',
    de: 'Beleg auswählen (PDF/JPG/PNG)',
    ru: 'Загрузите квитанцию (PDF/JPG/PNG)',
    tr: 'Dekont seçin (PDF/JPG/PNG)',
  },
  optionalNote: {
    en: 'Optional note',
    de: 'Optionale Notiz',
    ru: 'Дополнительная заметка',
    tr: 'Opsiyonel not',
  },
  placeholder: {
    en: 'Add the sender details to help us match your receipt',
    de: 'Geben Sie Absenderdetails an, damit wir den Beleg zuordnen können',
    ru: 'Добавьте данные отправителя, чтобы мы нашли ваш платеж',
    tr: 'Gönderen bilgilerini ekleyerek dekontu eşleştirmemize yardımcı olun',
  },
} as const;
type TranslationKey = keyof typeof UPLOAD_TRANSLATIONS;

@Component({
  selector: 'app-upload-receipt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-receipt.component.html',
  styleUrls: ['./upload-receipt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadReceiptComponent implements OnChanges {
  @Input() busy = false;
  @Input() successMessage: string | null = null;
  @Input() languageCode: string | null = FALLBACK_LANGUAGE;
  @Output() selectionChanged = new EventEmitter<{ file: File | null; note?: string | null }>();

  form: FormGroup;
  file: File | null = null;
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  protected copy: UploadReceiptCopy = this.buildCopy(FALLBACK_LANGUAGE);
  private readonly fallbackLanguage: LanguageCode = FALLBACK_LANGUAGE;

  constructor() {
    this.form = this.fb.group({
      note: [''],
    });
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.emitChange();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['languageCode']) {
      this.setCopy(changes['languageCode'].currentValue);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.file = (input.files && input.files.length ? input.files[0] : null);
    this.emitChange();
  }

  get value(): { file: File | null; note?: string | null } {
    return {
      file: this.file,
      note: this.form.value.note,
    };
  }

  reset(): void {
    this.form.reset();
    this.file = null;
    this.emitChange();
  }

  private emitChange(): void {
    this.selectionChanged.emit(this.value);
  }

  private setCopy(lang?: string | null): void {
    const normalized = this.normalizeLanguage(lang);
    this.copy = this.buildCopy(normalized);
  }

  private buildCopy(lang: LanguageCode): UploadReceiptCopy {
    return {
      chooseLabel: this.translate('chooseLabel', lang),
      optionalNote: this.translate('optionalNote', lang),
      placeholder: this.translate('placeholder', lang),
    };
  }

  private translate(key: TranslationKey, lang: LanguageCode): string {
    const entry = UPLOAD_TRANSLATIONS[key];
    return entry[lang] ?? entry[this.fallbackLanguage];
  }

  private normalizeLanguage(code?: string | null): LanguageCode {
    if (code && SUPPORTED_LANGUAGE_CODES.includes(code as LanguageCode)) {
      return code as LanguageCode;
    }
    return this.fallbackLanguage;
  }
}
