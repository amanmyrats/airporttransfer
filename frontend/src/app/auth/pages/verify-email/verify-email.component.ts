import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { take } from 'rxjs/operators';
import { LanguageService } from '../../../services/language.service';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AUTH_FALLBACK_LANGUAGE, AuthLanguageCode, normalizeAuthLanguage } from '../../constants/auth-language.constants';

const VERIFY_TRANSLATIONS = {
  title: {
    en: 'Email verification',
    de: 'E-Mail-Bestätigung',
    ru: 'Подтверждение email',
    tr: 'E-posta doğrulama',
  },
  loadingText: {
    en: 'Verifying your email…',
    de: 'E-Mail wird überprüft…',
    ru: 'Проверяем email…',
    tr: 'E-postanız doğrulanıyor…',
  },
  successTitle: {
    en: 'Email verified',
    de: 'E-Mail bestätigt',
    ru: 'Email подтвержден',
    tr: 'E-posta doğrulandı',
  },
  successMessage: {
    en: 'Your account is now active. You can log in to continue.',
    de: 'Ihr Konto ist jetzt aktiv. Sie können sich anmelden, um fortzufahren.',
    ru: 'Ваш аккаунт активирован. Можете войти, чтобы продолжить.',
    tr: 'Hesabınız artık aktif. Devam etmek için giriş yapabilirsiniz.',
  },
  successButton: {
    en: 'Go to login',
    de: 'Zum Login',
    ru: 'Перейти ко входу',
    tr: 'Girişe git',
  },
  errorTitle: {
    en: 'Verification failed',
    de: 'Bestätigung fehlgeschlagen',
    ru: 'Подтверждение не удалось',
    tr: 'Doğrulama başarısız',
  },
  errorFallback: {
    en: 'The verification link is invalid or has expired.',
    de: 'Der Bestätigungslink ist ungültig oder abgelaufen.',
    ru: 'Ссылка недействительна или устарела.',
    tr: 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.',
  },
  errorMissingToken: {
    en: 'Verification token is missing or invalid.',
    de: 'Bestätigungstoken fehlt oder ist ungültig.',
    ru: 'Отсутствует или недействительный токен подтверждения.',
    tr: 'Doğrulama kodu eksik veya geçersiz.',
  },
  errorVerificationFailed: {
    en: 'Verification failed. The link may have expired.',
    de: 'Bestätigung fehlgeschlagen. Der Link könnte abgelaufen sein.',
    ru: 'Подтверждение не удалось. Возможно, ссылка устарела.',
    tr: 'Doğrulama başarısız. Bağlantının süresi dolmuş olabilir.',
  },
  requestNew: {
    en: 'Request new email',
    de: 'Neuen Link anfordern',
    ru: 'Запросить новое письмо',
    tr: 'Yeni e-posta iste',
  },
} as const;

type VerifyTranslationKey = keyof typeof VERIFY_TRANSLATIONS;

interface VerifyCopy {
  title: string;
  loadingText: string;
  successTitle: string;
  successMessage: string;
  successButton: string;
  errorTitle: string;
  errorFallback: string;
  errorMissingToken: string;
  errorVerificationFailed: string;
  requestNew: string;
}

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, SuperHeaderComponent, NavbarComponent, FooterComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent {
  readonly loading = signal(true);
  readonly success = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private currentLang: AuthLanguageCode | null = null;
  protected copy: VerifyCopy;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authApi: AuthApiService,
    private readonly router: Router,
    private readonly languageService: LanguageService,
  ) {
    const lang = this.detectLanguage();
    this.currentLang = lang;
    this.copy = this.buildCopy(lang);

    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const key = params.get('key');
      if (!key) {
        this.loading.set(false);
        this.success.set(false);
        this.errorMessage.set(this.copy.errorMissingToken);
        return;
      }
      this.authApi.verifyEmail({ key }).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.success.set(false);
          this.errorMessage.set(this.copy.errorVerificationFailed);
        },
      });
    });
  }

  goToLogin(): void {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    const target = this.languageService.withLangPrefix('auth/login', lang);
    this.router.navigateByUrl(target).catch(() => {});
  }

  linkWithLang(path: string): string {
    const lang = this.currentLang ?? this.languageService.extractLangFromUrl(this.router.url);
    return this.languageService.withLangPrefix(path, lang);
  }

  private detectLanguage(): AuthLanguageCode {
    const urlLang = this.languageService.extractLangFromUrl(this.router.url);
    return normalizeAuthLanguage(urlLang ?? null);
  }

  private buildCopy(lang: AuthLanguageCode): VerifyCopy {
    return {
      title: this.translate('title', lang),
      loadingText: this.translate('loadingText', lang),
      successTitle: this.translate('successTitle', lang),
      successMessage: this.translate('successMessage', lang),
      successButton: this.translate('successButton', lang),
      errorTitle: this.translate('errorTitle', lang),
      errorFallback: this.translate('errorFallback', lang),
      errorMissingToken: this.translate('errorMissingToken', lang),
      errorVerificationFailed: this.translate('errorVerificationFailed', lang),
      requestNew: this.translate('requestNew', lang),
    };
  }

  private translate(key: VerifyTranslationKey, lang: AuthLanguageCode): string {
    const entry = VERIFY_TRANSLATIONS[key];
    return entry[lang] ?? entry[AUTH_FALLBACK_LANGUAGE];
  }
}
