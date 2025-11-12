import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChangePasswordComponent } from '../../../auth/pages/change-password/change-password.component';
import { LanguageService } from '../../../services/language.service';
import {
  ACCOUNT_FALLBACK_LANGUAGE,
  AccountLanguageCode,
  normalizeAccountLanguage,
} from '../../constants/account-language.constants';

const ACCOUNT_CHANGE_PASSWORD_TRANSLATIONS = {
  heading: {
    en: 'Update your password',
    de: 'Passwort aktualisieren',
    ru: 'Обновите пароль',
    tr: 'Şifrenizi güncelleyin',
  },
} as const;

type AccountChangePasswordKey = keyof typeof ACCOUNT_CHANGE_PASSWORD_TRANSLATIONS;

interface AccountChangePasswordCopy {
  heading: string;
}

@Component({
  selector: 'app-account-change-password',
  standalone: true,
  imports: [ChangePasswordComponent],
  template: `
    <section class="account-change-password">
      <h2>{{ copy.heading }}</h2>
      <app-auth-change-password></app-auth-change-password>
    </section>
  `,
  styles: [
    `
      .account-change-password {
        max-width: 560px;
        margin: 0 auto;
        padding: 1rem;
      }

      h2 {
        margin-bottom: 1rem;
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountChangePasswordComponent {
  protected copy: AccountChangePasswordCopy = {
    heading: ACCOUNT_CHANGE_PASSWORD_TRANSLATIONS.heading[ACCOUNT_FALLBACK_LANGUAGE],
  };

  constructor(
    private readonly router: Router,
    private readonly languageService: LanguageService,
  ) {
    const lang = this.detectLanguage();
    this.copy = {
      heading: this.translate('heading', lang),
    };
  }

  private detectLanguage(): AccountLanguageCode {
    const urlLang = this.languageService.extractLangFromUrl(this.router.url);
    const serviceLang = this.languageService.currentLang?.()?.code ?? null;
    return normalizeAccountLanguage(urlLang ?? serviceLang ?? null);
  }

  private translate(key: AccountChangePasswordKey, lang: AccountLanguageCode): string {
    const entry = ACCOUNT_CHANGE_PASSWORD_TRANSLATIONS[key];
    return entry[lang] ?? entry[ACCOUNT_FALLBACK_LANGUAGE];
  }
}
