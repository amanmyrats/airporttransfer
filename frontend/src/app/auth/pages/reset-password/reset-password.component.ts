import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { ResetPasswordPayload } from '../../models/auth.models';
import { take } from 'rxjs/operators';
import { LanguageService } from '../../../services/language.service';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AUTH_FALLBACK_LANGUAGE, AuthLanguageCode, normalizeAuthLanguage } from '../../constants/auth-language.constants';

const RESET_TRANSLATIONS = {
  title: {
    en: 'Set a new password',
    de: 'Neues Passwort festlegen',
    ru: 'Установите новый пароль',
    tr: 'Yeni bir şifre belirleyin',
  },
  subtitle: {
    en: 'Choose a strong password to secure your account.',
    de: 'Wählen Sie ein sicheres Passwort, um Ihr Konto zu schützen.',
    ru: 'Выберите надежный пароль для защиты аккаунта.',
    tr: 'Hesabınızı korumak için güçlü bir şifre seçin.',
  },
  newPasswordLabel: {
    en: 'New password',
    de: 'Neues Passwort',
    ru: 'Новый пароль',
    tr: 'Yeni şifre',
  },
  newPasswordError: {
    en: 'Minimum 6 characters required.',
    de: 'Mindestens 6 Zeichen erforderlich.',
    ru: 'Минимум 6 символов.',
    tr: 'En az 6 karakter olmalıdır.',
  },
  confirmPasswordLabel: {
    en: 'Confirm password',
    de: 'Passwort bestätigen',
    ru: 'Подтвердите пароль',
    tr: 'Şifreyi doğrulayın',
  },
  submitIdle: {
    en: 'Reset password',
    de: 'Passwort zurücksetzen',
    ru: 'Сбросить пароль',
    tr: 'Şifreyi sıfırla',
  },
  submitBusy: {
    en: 'Updating…',
    de: 'Aktualisieren…',
    ru: 'Обновляем…',
    tr: 'Güncelleniyor…',
  },
  statusInvalidExpired: {
    en: 'Password reset link is invalid or expired.',
    de: 'Der Link zum Zurücksetzen ist ungültig oder abgelaufen.',
    ru: 'Ссылка для сброса недействительна или устарела.',
    tr: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.',
  },
  statusInvalid: {
    en: 'Password reset link is invalid.',
    de: 'Link zum Zurücksetzen ist ungültig.',
    ru: 'Ссылка для сброса недействительна.',
    tr: 'Şifre sıfırlama bağlantısı geçersiz.',
  },
  statusMismatch: {
    en: 'Passwords do not match.',
    de: 'Passwörter stimmen nicht überein.',
    ru: 'Пароли не совпадают.',
    tr: 'Şifreler uyuşmuyor.',
  },
  statusResetFailed: {
    en: 'Reset failed. Please request a new reset link.',
    de: 'Zurücksetzen fehlgeschlagen. Fordern Sie einen neuen Link an.',
    ru: 'Сброс не выполнен. Запросите новую ссылку.',
    tr: 'Sıfırlama başarısız. Lütfen yeni bir bağlantı isteyin.',
  },
  successTitle: {
    en: 'Password updated',
    de: 'Passwort aktualisiert',
    ru: 'Пароль обновлен',
    tr: 'Şifre güncellendi',
  },
  successMessage: {
    en: 'Your password has been updated. You can now log in with your new credentials.',
    de: 'Ihr Passwort wurde geändert. Sie können sich jetzt mit den neuen Daten anmelden.',
    ru: 'Пароль изменен. Теперь вы можете войти с новыми данными.',
    tr: 'Şifreniz güncellendi. Artık yeni bilgilerinizle giriş yapabilirsiniz.',
  },
  backToLogin: {
    en: 'Back to login',
    de: 'Zurück zum Login',
    ru: 'Вернуться к входу',
    tr: 'Girişe dön',
  },
} as const;

type ResetTranslationKey = keyof typeof RESET_TRANSLATIONS;

interface ResetCopy {
  title: string;
  subtitle: string;
  newPasswordLabel: string;
  newPasswordError: string;
  confirmPasswordLabel: string;
  submitIdle: string;
  submitBusy: string;
  status: {
    invalidExpired: string;
    invalid: string;
    mismatch: string;
    resetFailed: string;
  };
  successTitle: string;
  successMessage: string;
  backToLogin: string;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SuperHeaderComponent, NavbarComponent, FooterComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  readonly form: FormGroup;
  readonly loading = signal(false);
  readonly completed = signal(false);
  readonly statusMessage = signal<{ type: 'error'; text: string } | null>(null);
  private uid: string | null = null;
  private token: string | null = null;
  protected copy: ResetCopy;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly authApi: AuthApiService,
    private readonly router: Router,
    private readonly languageService: LanguageService,
  ) {
    this.form = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]],
    });
    const lang = this.detectLanguage();
    this.copy = this.buildCopy(lang);

    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      this.uid = params.get('uid');
      this.token = params.get('token');
      if (!this.uid || !this.token) {
        this.statusMessage.set({ type: 'error', text: this.copy.status.invalidExpired });
      }
    });
  }

  submit(): void {
    if (!this.uid || !this.token) {
      this.statusMessage.set({ type: 'error', text: this.copy.status.invalid });
      return;
    }
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.value.new_password !== this.form.value.confirm_password) {
      this.statusMessage.set({ type: 'error', text: this.copy.status.mismatch });
      return;
    }
    this.statusMessage.set(null);
    const payload: ResetPasswordPayload = {
      uid: this.uid,
      token: this.token,
      new_password: this.form.value.new_password,
    };
    this.loading.set(true);
    this.authApi.resetPassword(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.completed.set(true);
        this.statusMessage.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err?.error?.detail || this.copy.status.resetFailed;
        this.statusMessage.set({ type: 'error', text: detail });
      },
    });
  }

  goToLogin(): void {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    const target = this.languageService.withLangPrefix('auth/login', lang);
    this.router.navigateByUrl(target).catch(() => {});
  }

  private detectLanguage(): AuthLanguageCode {
    const routeLang = this.languageService.extractLangFromUrl(this.router.url);
    return normalizeAuthLanguage(routeLang ?? null);
  }

  private buildCopy(lang: AuthLanguageCode): ResetCopy {
    return {
      title: this.translate('title', lang),
      subtitle: this.translate('subtitle', lang),
      newPasswordLabel: this.translate('newPasswordLabel', lang),
      newPasswordError: this.translate('newPasswordError', lang),
      confirmPasswordLabel: this.translate('confirmPasswordLabel', lang),
      submitIdle: this.translate('submitIdle', lang),
      submitBusy: this.translate('submitBusy', lang),
      status: {
        invalidExpired: this.translate('statusInvalidExpired', lang),
        invalid: this.translate('statusInvalid', lang),
        mismatch: this.translate('statusMismatch', lang),
        resetFailed: this.translate('statusResetFailed', lang),
      },
      successTitle: this.translate('successTitle', lang),
      successMessage: this.translate('successMessage', lang),
      backToLogin: this.translate('backToLogin', lang),
    };
  }

  private translate(key: ResetTranslationKey, lang: AuthLanguageCode): string {
    const entry = RESET_TRANSLATIONS[key];
    return entry[lang] ?? entry[AUTH_FALLBACK_LANGUAGE];
  }
}
