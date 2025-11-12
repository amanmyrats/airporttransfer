import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FloatLabel } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageService } from '../../../services/language.service';
import { AUTH_FALLBACK_LANGUAGE, AuthLanguageCode, normalizeAuthLanguage } from '../../constants/auth-language.constants';

const CHANGE_PASSWORD_TRANSLATIONS = {
  currentLabel: {
    en: 'Current password',
    de: 'Aktuelles Passwort',
    ru: 'Текущий пароль',
    tr: 'Mevcut şifre',
  },
  currentRequired: {
    en: 'Current password is required.',
    de: 'Aktuelles Passwort erforderlich.',
    ru: 'Введите текущий пароль.',
    tr: 'Mevcut şifre gerekli.',
  },
  newLabel: {
    en: 'New password',
    de: 'Neues Passwort',
    ru: 'Новый пароль',
    tr: 'Yeni şifre',
  },
  newRequired: {
    en: 'New password is required.',
    de: 'Neues Passwort erforderlich.',
    ru: 'Введите новый пароль.',
    tr: 'Yeni şifre gerekli.',
  },
  newMinLength: {
    en: 'Password must be at least 6 characters long.',
    de: 'Passwort muss mindestens 6 Zeichen lang sein.',
    ru: 'Пароль должен содержать минимум 6 символов.',
    tr: 'Şifre en az 6 karakter olmalıdır.',
  },
  confirmLabel: {
    en: 'Confirm new password',
    de: 'Neues Passwort bestätigen',
    ru: 'Подтвердите новый пароль',
    tr: 'Yeni şifreyi doğrulayın',
  },
  confirmRequired: {
    en: 'Confirmation is required.',
    de: 'Bestätigung erforderlich.',
    ru: 'Подтверждение обязательно.',
    tr: 'Doğrulama gerekli.',
  },
  confirmMismatch: {
    en: 'Passwords do not match.',
    de: 'Passwörter stimmen nicht überein.',
    ru: 'Пароли не совпадают.',
    tr: 'Şifreler uyuşmuyor.',
  },
  submitLabel: {
    en: 'Change password',
    de: 'Passwort ändern',
    ru: 'Изменить пароль',
    tr: 'Şifreyi değiştir',
  },
  toastSuccessSummary: {
    en: 'Password changed',
    de: 'Passwort geändert',
    ru: 'Пароль изменен',
    tr: 'Şifre değiştirildi',
  },
  toastSuccessDetail: {
    en: 'Please sign in again.',
    de: 'Bitte melden Sie sich erneut an.',
    ru: 'Пожалуйста, войдите снова.',
    tr: 'Lütfen yeniden giriş yapın.',
  },
  toastErrorSummary: {
    en: 'Error',
    de: 'Fehler',
    ru: 'Ошибка',
    tr: 'Hata',
  },
  toastErrorDetail: {
    en: 'Failed to change password.',
    de: 'Passwort konnte nicht geändert werden.',
    ru: 'Не удалось изменить пароль.',
    tr: 'Şifre değiştirilemedi.',
  },
  toastReviewSummary: {
    en: 'Please review the form',
    de: 'Bitte prüfen Sie das Formular',
    ru: 'Проверьте форму',
    tr: 'Lütfen formu kontrol edin',
  },
} as const;

type ChangePasswordKey = keyof typeof CHANGE_PASSWORD_TRANSLATIONS;

interface ChangePasswordCopy {
  labels: {
    current: string;
    new: string;
    confirm: string;
  };
  errors: {
    currentRequired: string;
    newRequired: string;
    newMinLength: string;
    confirmRequired: string;
    confirmMismatch: string;
  };
  submitLabel: string;
  toasts: {
    successSummary: string;
    successDetail: string;
    errorSummary: string;
    errorDetail: string;
    reviewSummary: string;
  };
}

@Component({
  selector: 'app-auth-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordModule, ButtonModule, FloatLabel],
  providers: [MessageService],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly languageService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  readonly serverErrors = signal<Record<string, string>>({});
  readonly submitting = signal(false);
  protected copy: ChangePasswordCopy = this.buildCopy(this.detectLanguage());

  readonly form: FormGroup = this.fb.group({
    old_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', Validators.required],
  }, { validators: this.passwordConfirmationValidator });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.clearServerErrors();
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.clearServerErrors();
    this.submitting.set(true);
    this.authService.changePassword(
      this.form.value.old_password,
      this.form.value.new_password,
      this.form.value.confirm_password,
    ).subscribe({
      next: () => {
        this.clearServerErrors();
        this.submitting.set(false);
        this.messageService.add({ severity: 'success', summary: this.copy.toasts.successSummary, detail: this.copy.toasts.successDetail });
        this.authService.logout().subscribe({
          next: () => this.router.navigate(['/auth/login']).catch(() => {}),
          error: () => this.router.navigate(['/auth/login']).catch(() => {}),
        });
      },
      error: (err) => {
        const { summary, detail, fieldErrors } = this.extractErrorMessage(err?.error);
        this.serverErrors.set(fieldErrors);
        this.messageService.add({ severity: 'error', summary, detail });
        this.applyFieldErrors(fieldErrors);
        this.submitting.set(false);
      },
    });
  }

  private passwordConfirmationValidator(group: FormGroup): void {
    const newPassword = group.get('new_password');
    const confirmPassword = group.get('confirm_password');
    if (!confirmPassword) {
      return;
    }
    if (newPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...(confirmPassword.errors || {}), passwordMismatch: true });
      return;
    }
    if (confirmPassword.errors?.['passwordMismatch']) {
      const { passwordMismatch, ...rest } = confirmPassword.errors;
      confirmPassword.setErrors(Object.keys(rest).length ? rest : null);
    }
  }

  private extractErrorMessage(error: unknown): { summary: string; detail: string; fieldErrors: Record<string, string> } {
    const fallback = {
      summary: this.copy.toasts.errorSummary,
      detail: this.copy.toasts.errorDetail,
      fieldErrors: {} as Record<string, string>,
    };

    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const response = error as Record<string, unknown>;
    const fieldErrors: Record<string, string> = {};

    const detail = response['detail'];
    if (typeof detail === 'string' && detail.trim()) {
      return { summary: this.copy.toasts.errorSummary, detail, fieldErrors };
    }

    for (const [key, value] of Object.entries(response)) {
      if (Array.isArray(value) && value.length) {
        const first = value[0];
        if (typeof first === 'string' && first.trim()) {
          fieldErrors[key] = first;
        }
      } else if (typeof value === 'string' && value.trim()) {
        fieldErrors[key] = value;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      const first = fieldErrors[Object.keys(fieldErrors)[0]];
      return { summary: this.copy.toasts.reviewSummary, detail: first, fieldErrors };
    }

    return fallback;
  }

  private applyFieldErrors(errors: Record<string, string>): void {
    Object.entries(errors).forEach(([field, message]) => {
      const control = this.form.get(field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), server: message });
        control.markAsTouched();
      }
    });
  }

  private clearServerErrors(): void {
    if (!Object.keys(this.serverErrors()).length) {
      return;
    }
    this.serverErrors.set({});
    Object.values(this.form.controls).forEach(control => {
      if (control.errors?.['server']) {
        const { server, ...rest } = control.errors;
        control.setErrors(Object.keys(rest).length ? rest : null);
      }
    });
  }

  private detectLanguage(): AuthLanguageCode {
    const lang = this.languageService.currentLang?.()?.code ?? null;
    return normalizeAuthLanguage(lang);
  }

  private buildCopy(lang: AuthLanguageCode): ChangePasswordCopy {
    return {
      labels: {
        current: this.translate('currentLabel', lang),
        new: this.translate('newLabel', lang),
        confirm: this.translate('confirmLabel', lang),
      },
      errors: {
        currentRequired: this.translate('currentRequired', lang),
        newRequired: this.translate('newRequired', lang),
        newMinLength: this.translate('newMinLength', lang),
        confirmRequired: this.translate('confirmRequired', lang),
        confirmMismatch: this.translate('confirmMismatch', lang),
      },
      submitLabel: this.translate('submitLabel', lang),
      toasts: {
        successSummary: this.translate('toastSuccessSummary', lang),
        successDetail: this.translate('toastSuccessDetail', lang),
        errorSummary: this.translate('toastErrorSummary', lang),
        errorDetail: this.translate('toastErrorDetail', lang),
        reviewSummary: this.translate('toastReviewSummary', lang),
      },
    };
  }

  private translate(key: ChangePasswordKey, lang: AuthLanguageCode): string {
    const entry = CHANGE_PASSWORD_TRANSLATIONS[key];
    return entry[lang] ?? entry[AUTH_FALLBACK_LANGUAGE];
  }
}
