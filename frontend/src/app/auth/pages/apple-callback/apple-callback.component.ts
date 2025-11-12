import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';
import { LanguageService } from '../../../services/language.service';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AUTH_FALLBACK_LANGUAGE, AuthLanguageCode, normalizeAuthLanguage } from '../../constants/auth-language.constants';

const APPLE_TRANSLATIONS = {
  processing: {
    en: 'Completing Apple sign-in…',
    de: 'Apple-Anmeldung wird abgeschlossen…',
    ru: 'Завершаем вход через Apple…',
    tr: 'Apple ile giriş tamamlanıyor…',
  },
  missingToken: {
    en: 'Apple sign-in failed: missing identity token.',
    de: 'Apple-Anmeldung fehlgeschlagen: Token fehlt.',
    ru: 'Вход через Apple не удался: отсутствует токен.',
    tr: 'Apple ile giriş başarısız: kimlik belirteci eksik.',
  },
  genericError: {
    en: 'Apple sign-in failed. Please try again.',
    de: 'Apple-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    ru: 'Вход через Apple не удался. Попробуйте снова.',
    tr: 'Apple ile giriş başarısız. Lütfen tekrar deneyin.',
  },
} as const;

type AppleTranslationKey = keyof typeof APPLE_TRANSLATIONS;

@Component({
  selector: 'app-apple-callback',
  standalone: true,
  imports: [CommonModule, SuperHeaderComponent, NavbarComponent, FooterComponent],
  templateUrl: './apple-callback.component.html',
  styleUrl: './apple-callback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppleCallbackComponent {
  readonly processing = signal(true);
  readonly statusMessage = signal<string | null>(null);
  protected processingLabel: string;
  private readonly lang: AuthLanguageCode;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly authService: AuthService,
    private readonly languageService: LanguageService,
  ) {
    this.lang = this.detectLanguage();
    this.processingLabel = this.translate('processing', this.lang);
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const token = params.get('id_token');
      if (!token) {
        this.processing.set(false);
        this.statusMessage.set(this.translate('missingToken', this.lang));
        this.router.navigate(['/auth/login']).catch(() => {});
        return;
      }
      this.authApi.socialApple({ identity_token: token }).subscribe({
        next: (res) => {
          this.authService.setSession(res);
          this.processing.set(false);
          const lang = this.languageService.extractLangFromUrl(this.router.url);
          const target = this.languageService.withLangPrefix('account', lang);
          this.router.navigateByUrl(target).catch(() => {});
        },
        error: () => {
          this.processing.set(false);
          this.statusMessage.set(this.translate('genericError', this.lang));
          const lang = this.languageService.extractLangFromUrl(this.router.url);
          const target = this.languageService.withLangPrefix('auth/login', lang);
          this.router.navigateByUrl(target).catch(() => {});
        },
      });
    });
  }

  private detectLanguage(): AuthLanguageCode {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    return normalizeAuthLanguage(lang ?? null);
  }

  private translate(key: AppleTranslationKey, lang: AuthLanguageCode): string {
    const entry = APPLE_TRANSLATIONS[key];
    return entry[lang] ?? entry[AUTH_FALLBACK_LANGUAGE];
  }
}
