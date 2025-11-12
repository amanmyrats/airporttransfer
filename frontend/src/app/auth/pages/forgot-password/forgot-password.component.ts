import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { LanguageService } from '../../../services/language.service';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AUTH_FALLBACK_LANGUAGE, AuthLanguageCode, normalizeAuthLanguage } from '../../constants/auth-language.constants';

const FORGOT_TRANSLATIONS = {
  title: {
    en: 'Forgot your password?',
    de: 'Passwort vergessen?',
    ru: 'Забыли пароль?',
    tr: 'Şifrenizi mi unuttunuz?',
  },
  subtitle: {
    en: 'Enter your email address and we will send reset instructions if an account exists.',
    de: 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen Anweisungen, falls ein Konto existiert.',
    ru: 'Укажите адрес email, и мы отправим инструкции по сбросу, если аккаунт существует.',
    tr: 'E-posta adresinizi girin; bir hesap varsa sıfırlama talimatları göndeririz.',
  },
  emailLabel: {
    en: 'Email',
    de: 'E-Mail',
    ru: 'Email',
    tr: 'E-posta',
  },
  emailError: {
    en: 'Please enter a valid email address.',
    de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    ru: 'Укажите действительный email.',
    tr: 'Lütfen geçerli bir e-posta adresi girin.',
  },
  submitIdle: {
    en: 'Send reset link',
    de: 'Link zum Zurücksetzen senden',
    ru: 'Отправить ссылку для сброса',
    tr: 'Sıfırlama bağlantısı gönder',
  },
  submitBusy: {
    en: 'Sending…',
    de: 'Senden…',
    ru: 'Отправляем…',
    tr: 'Gönderiliyor…',
  },
  confirmTitle: {
    en: 'Check your email',
    de: 'Prüfen Sie Ihr E-Mail-Postfach',
    ru: 'Проверьте почту',
    tr: 'E-postanızı kontrol edin',
  },
  confirmMessage: {
    en: 'If an account exists for this email address, you will receive reset instructions shortly.',
    de: 'Falls für diese Adresse ein Konto existiert, erhalten Sie in Kürze Anweisungen zum Zurücksetzen.',
    ru: 'Если для этого адреса есть аккаунт, вскоре придут инструкции по сбросу.',
    tr: 'Bu e-posta için bir hesap varsa kısa süre içinde sıfırlama talimatları alacaksınız.',
  },
  backToLogin: {
    en: 'Back to login',
    de: 'Zurück zum Login',
    ru: 'Вернуться к входу',
    tr: 'Girişe dön',
  },
} as const;

type ForgotTranslationKey = keyof typeof FORGOT_TRANSLATIONS;

interface ForgotCopy {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailError: string;
  submitIdle: string;
  submitBusy: string;
  confirmTitle: string;
  confirmMessage: string;
  backToLogin: string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SuperHeaderComponent, NavbarComponent, FooterComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  readonly form: FormGroup;
  readonly loading = signal(false);
  readonly sent = signal(false);
  protected copy: ForgotCopy;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authApi: AuthApiService,
    private readonly router: Router,
    private readonly languageService: LanguageService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    const lang = this.detectLanguage();
    this.copy = this.buildCopy(lang);
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.authApi.forgotPassword({ email: this.form.value.email }).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
    });
  }

  backToLogin(): void {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    const target = this.languageService.withLangPrefix('auth/login', lang);
    this.router.navigateByUrl(target).catch(() => {});
  }

  private detectLanguage(): AuthLanguageCode {
    const routeLang = this.languageService.extractLangFromUrl(this.router.url);
    return normalizeAuthLanguage(routeLang ?? null);
  }

  private buildCopy(lang: AuthLanguageCode): ForgotCopy {
    return {
      title: this.translate('title', lang),
      subtitle: this.translate('subtitle', lang),
      emailLabel: this.translate('emailLabel', lang),
      emailError: this.translate('emailError', lang),
      submitIdle: this.translate('submitIdle', lang),
      submitBusy: this.translate('submitBusy', lang),
      confirmTitle: this.translate('confirmTitle', lang),
      confirmMessage: this.translate('confirmMessage', lang),
      backToLogin: this.translate('backToLogin', lang),
    };
  }

  private translate(key: ForgotTranslationKey, lang: AuthLanguageCode): string {
    const entry = FORGOT_TRANSLATIONS[key];
    return entry[lang] ?? entry[AUTH_FALLBACK_LANGUAGE];
  }
}
