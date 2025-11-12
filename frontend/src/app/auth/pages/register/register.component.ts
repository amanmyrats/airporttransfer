import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { RegisterPayload } from '../../models/auth.models';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { LanguageService } from '../../../services/language.service';
import { AUTH_FALLBACK_LANGUAGE, AuthLanguageCode, normalizeAuthLanguage } from '../../constants/auth-language.constants';

interface LanguageOption {
  code: 'en' | 'de' | 'ru' | 'tr';
  label: string;
}

const REGISTER_TRANSLATIONS = {
  title: {
    en: 'Create your account',
    de: 'Konto erstellen',
    ru: 'Создайте аккаунт',
    tr: 'Hesabınızı oluşturun',
  },
  subtitle: {
    en: 'Register to book transfers, manage reservations, and update your profile.',
    de: 'Registrieren Sie sich, um Transfers zu buchen, Reservierungen zu verwalten und Ihr Profil zu pflegen.',
    ru: 'Зарегистрируйтесь, чтобы бронировать трансферы и управлять профилем.',
    tr: 'Transfer rezervasyonu yapmak ve profilinizi yönetmek için kaydolun.',
  },
  emailLabel: {
    en: 'Email',
    de: 'E-Mail',
    ru: 'Email',
    tr: 'E-posta',
  },
  passwordLabel: {
    en: 'Password',
    de: 'Passwort',
    ru: 'Пароль',
    tr: 'Şifre',
  },
  firstNameLabel: {
    en: 'First name',
    de: 'Vorname',
    ru: 'Имя',
    tr: 'Ad',
  },
  lastNameLabel: {
    en: 'Last name',
    de: 'Nachname',
    ru: 'Фамилия',
    tr: 'Soyad',
  },
  preferredLanguageLabel: {
    en: 'Preferred language',
    de: 'Bevorzugte Sprache',
    ru: 'Предпочитаемый язык',
    tr: 'Tercih edilen dil',
  },
  submitIdle: {
    en: 'Register',
    de: 'Registrieren',
    ru: 'Зарегистрироваться',
    tr: 'Kayıt ol',
  },
  submitBusy: {
    en: 'Creating account…',
    de: 'Konto wird erstellt…',
    ru: 'Создаем аккаунт…',
    tr: 'Hesap oluşturuluyor…',
  },
  footerPrompt: {
    en: 'Already have an account?',
    de: 'Bereits ein Konto?',
    ru: 'Уже есть аккаунт?',
    tr: 'Zaten hesabınız var mı?',
  },
  footerLink: {
    en: 'Login',
    de: 'Anmelden',
    ru: 'Войти',
    tr: 'Giriş yap',
  },
  successTitle: {
    en: 'Verify your email',
    de: 'Bestätigen Sie Ihre E-Mail',
    ru: 'Подтвердите email',
    tr: 'E-postanızı doğrulayın',
  },
  successMessage: {
    en: 'We sent a verification link to your inbox. Confirm your email to activate the account.',
    de: 'Wir haben einen Bestätigungslink gesendet. Aktivieren Sie Ihr Konto über die E-Mail.',
    ru: 'Мы отправили ссылку для подтверждения. Активируйте аккаунт через письмо.',
    tr: 'Gelen kutunuza doğrulama bağlantısı gönderdik. Hesabı etkinleştirmek için e-postanızı onaylayın.',
  },
  successBack: {
    en: 'Back to login',
    de: 'Zurück zum Login',
    ru: 'Вернуться к входу',
    tr: 'Girişe dön',
  },
  errorRequired: {
    en: 'This field is required.',
    de: 'Dieses Feld ist erforderlich.',
    ru: 'Это обязательное поле.',
    tr: 'Bu alan zorunludur.',
  },
  errorEmail: {
    en: 'Please enter a valid email address.',
    de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    ru: 'Укажите действительный email.',
    tr: 'Lütfen geçerli bir e-posta adresi girin.',
  },
  errorMinLength: {
    en: 'Must be at least {min} characters long.',
    de: 'Mindestens {min} Zeichen lang.',
    ru: 'Минимум {min} символов.',
    tr: 'En az {min} karakter olmalıdır.',
  },
  errorGeneral: {
    en: 'Registration failed. Please try again later.',
    de: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es später noch einmal.',
    ru: 'Регистрация не удалась. Попробуйте позже.',
    tr: 'Kayıt başarısız. Lütfen daha sonra tekrar deneyin.',
  },
} as const;

type RegisterTranslationKey = keyof typeof REGISTER_TRANSLATIONS;

interface RegisterCopy {
  title: string;
  subtitle: string;
  labels: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    preferredLanguage: string;
  };
  submitIdle: string;
  submitBusy: string;
  footerPrompt: string;
  footerLink: string;
  successTitle: string;
  successMessage: string;
  successBack: string;
  errors: {
    required: string;
    email: string;
    minLength: string;
    general: string;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SuperHeaderComponent, NavbarComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  readonly form: FormGroup;
  readonly loading = signal(false);
  readonly success = signal(false);
  readonly serverFieldErrors = signal<Record<string, string[]>>({});
  readonly serverGeneralErrors = signal<string[]>([]);
  readonly languages: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ru', label: 'Русский' },
    { code: 'tr', label: 'Türkçe' },
  ];
  protected copy: RegisterCopy;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly languageService: LanguageService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      first_name: [''],
      last_name: [''],
      preferred_language: [this.languages[0].code, Validators.required],
    });

    const lang = this.detectLanguage();
    this.copy = this.buildCopy(lang);
    this.form.patchValue({ preferred_language: lang });
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.resetServerErrors();
    this.loading.set(true);
    const payload: RegisterPayload = {
      email: this.form.value.email,
      password: this.form.value.password,
      first_name: this.form.value.first_name || undefined,
      preferred_language: this.form.value.preferred_language,
    };
    console.log('Register payload:', payload);
    this.authApi.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.handleSubmitError(err);
        console.error('Registration error:', err);
      },
    });
  }

  navigateToLogin(): void {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    const target = this.languageService.withLangPrefix('auth/login', lang);
    this.router.navigateByUrl(target).catch(() => {});
  }

  get passwordControl() {
    return this.form.get('password');
  }

  fieldErrors(controlName: string): string[] {
    const errors: string[] = [];
    const control = this.form.get(controlName);
    if (!control) {
      return errors;
    }
    const controlErrors = control.errors;
    if (control.invalid && (control.touched || control.dirty) && controlErrors) {
      if (controlErrors['required']) {
        errors.push(this.copy.errors.required);
      }
      if (controlErrors['email']) {
        errors.push(this.copy.errors.email);
      }
      if (controlErrors['minlength']) {
        const required = controlErrors['minlength'].requiredLength;
        errors.push(this.copy.errors.minLength.replace('{min}', String(required)));
      }
    }
    const serverErrors = this.serverFieldErrors()[controlName];
    if (serverErrors?.length) {
      errors.push(...serverErrors);
    }
    return errors;
  }

  controlInvalid(controlName: string): boolean {
    const serverErrorExists = !!this.serverFieldErrors()[controlName]?.length;
    const control = this.form.get(controlName);
    if (!control) {
      return serverErrorExists;
    }
    return (
      serverErrorExists ||
      (control.invalid && (control.touched || control.dirty))
    );
  }

  private resetServerErrors(): void {
    this.serverFieldErrors.set({});
    this.serverGeneralErrors.set([]);
  }

  private handleSubmitError(error: unknown): void {
    const fieldErrors: Record<string, string[]> = {};
    const generalErrors: string[] = [];

    const responseError = this.extractResponseError(error);

    if (typeof responseError === 'string') {
      generalErrors.push(responseError);
    } else if (responseError && typeof responseError === 'object') {
      const entries = Object.entries(responseError as Record<string, unknown>);
      if (!entries.length) {
        generalErrors.push(this.copy.errors.general);
      }
      for (const [key, value] of entries) {
        const messages = this.normalizeErrorValue(value);
        if (!messages.length) {
          continue;
        }
        if (this.form.contains(key)) {
          fieldErrors[key] = messages;
        } else if (key === 'non_field_errors' || key === 'detail') {
          generalErrors.push(...messages);
        } else {
          generalErrors.push(...messages);
        }
      }
    } else {
      generalErrors.push(this.copy.errors.general);
    }

    const hasFieldErrors = Object.keys(fieldErrors).length > 0;
    this.serverFieldErrors.set(fieldErrors);
    this.serverGeneralErrors.set(
      generalErrors.length ? generalErrors : hasFieldErrors ? [] : [this.copy.errors.general],
    );
  }

  private extractResponseError(error: unknown): unknown {
    if (error instanceof HttpErrorResponse) {
      return error.error ?? error.message;
    }
    if (typeof error === 'object' && error !== null && 'error' in (error as Record<string, unknown>)) {
      return (error as Record<string, unknown>)['error'];
    }
    return error;
  }

  private normalizeErrorValue(value: unknown): string[] {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === 'string' ? item : String(item)));
    }
    if (typeof value === 'string') {
      return [value];
    }
    if (typeof value === 'object') {
      return Object.values(value)
        .map((item) => this.normalizeErrorValue(item))
        .flat();
    }
    return [String(value)];
  }

  private detectLanguage(): AuthLanguageCode {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    return normalizeAuthLanguage(lang ?? null);
  }

  private buildCopy(lang: AuthLanguageCode): RegisterCopy {
    return {
      title: this.translate('title', lang),
      subtitle: this.translate('subtitle', lang),
      labels: {
        email: this.translate('emailLabel', lang),
        password: this.translate('passwordLabel', lang),
        firstName: this.translate('firstNameLabel', lang),
        lastName: this.translate('lastNameLabel', lang),
        preferredLanguage: this.translate('preferredLanguageLabel', lang),
      },
      submitIdle: this.translate('submitIdle', lang),
      submitBusy: this.translate('submitBusy', lang),
      footerPrompt: this.translate('footerPrompt', lang),
      footerLink: this.translate('footerLink', lang),
      successTitle: this.translate('successTitle', lang),
      successMessage: this.translate('successMessage', lang),
      successBack: this.translate('successBack', lang),
      errors: {
        required: this.translate('errorRequired', lang),
        email: this.translate('errorEmail', lang),
        minLength: this.translate('errorMinLength', lang),
        general: this.translate('errorGeneral', lang),
      },
    };
  }

  private translate(key: RegisterTranslationKey, lang: AuthLanguageCode): string {
    const entry = REGISTER_TRANSLATIONS[key];
    return entry[lang] ?? entry[AUTH_FALLBACK_LANGUAGE];
  }
}
