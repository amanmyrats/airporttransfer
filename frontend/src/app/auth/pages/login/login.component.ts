import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';
import { AuthUser, LoginPayload } from '../../models/auth.models';
import { SocialAuthService } from '../../services/social-auth.service';
import { take } from 'rxjs/operators';
import { LanguageService } from '../../../services/language.service';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AUTH_FALLBACK_LANGUAGE, AuthLanguageCode, normalizeAuthLanguage } from '../../constants/auth-language.constants';

declare const google: any;
declare const AppleID: any;
declare const FB: any;

const LOGIN_TRANSLATIONS = {
  title: {
    en: 'Sign in',
    de: 'Anmelden',
    ru: 'Войти',
    tr: 'Giriş yapın',
  },
  subtitle: {
    en: 'Access your AirportTransfer account to manage bookings and profile.',
    de: 'Greifen Sie auf Ihr AirportTransfer-Konto zu, um Buchungen und Ihr Profil zu verwalten.',
    ru: 'Войдите в аккаунт AirportTransfer, чтобы управлять бронированиями и профилем.',
    tr: 'Rezervasyonlarınızı ve profilinizi yönetmek için AirportTransfer hesabınıza erişin.',
  },
  googleButton: {
    en: 'Continue with Google',
    de: 'Mit Google fortfahren',
    ru: 'Продолжить через Google',
    tr: 'Google ile devam et',
  },
  facebookButton: {
    en: 'Continue with Facebook',
    de: 'Mit Facebook fortfahren',
    ru: 'Продолжить через Facebook',
    tr: 'Facebook ile devam et',
  },
  appleButton: {
    en: 'Continue with Apple',
    de: 'Mit Apple fortfahren',
    ru: 'Продолжить через Apple',
    tr: 'Apple ile devam et',
  },
  divider: {
    en: 'or sign in with email',
    de: 'oder mit E-Mail anmelden',
    ru: 'или войдите по email',
    tr: 'veya e-posta ile giriş yapın',
  },
  emailLabel: {
    en: 'Email',
    de: 'E-Mail',
    ru: 'Email',
    tr: 'E-posta',
  },
  emailError: {
    en: 'Email is required.',
    de: 'E-Mail ist erforderlich.',
    ru: 'Укажите email.',
    tr: 'E-posta gerekli.',
  },
  passwordLabel: {
    en: 'Password',
    de: 'Passwort',
    ru: 'Пароль',
    tr: 'Şifre',
  },
  passwordError: {
    en: 'Password is required.',
    de: 'Passwort ist erforderlich.',
    ru: 'Введите пароль.',
    tr: 'Şifre gerekli.',
  },
  rememberMe: {
    en: 'Remember me',
    de: 'Angemeldet bleiben',
    ru: 'Запомнить меня',
    tr: 'Beni hatırla',
  },
  forgotPassword: {
    en: 'Forgot password?',
    de: 'Passwort vergessen?',
    ru: 'Забыли пароль?',
    tr: 'Şifrenizi mi unuttunuz?',
  },
  submitIdle: {
    en: 'Login',
    de: 'Anmelden',
    ru: 'Войти',
    tr: 'Giriş yap',
  },
  submitBusy: {
    en: 'Signing in…',
    de: 'Anmeldung läuft…',
    ru: 'Вход…',
    tr: 'Giriş yapılıyor…',
  },
  footerPrompt: {
    en: 'New here?',
    de: 'Neu hier?',
    ru: 'Впервые у нас?',
    tr: 'Yeni misiniz?',
  },
  registerLink: {
    en: 'Create an account',
    de: 'Konto erstellen',
    ru: 'Создать аккаунт',
    tr: 'Hesap oluştur',
  },
  statusLoginFailed: {
    en: 'Login failed. Please check your credentials and try again.',
    de: 'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Daten und versuchen Sie es erneut.',
    ru: 'Не удалось войти. Проверьте данные и попробуйте снова.',
    tr: 'Giriş başarısız. Bilgilerinizi kontrol edin ve tekrar deneyin.',
  },
  statusGoogleUnavailable: {
    en: 'Google Sign-In is not available at the moment.',
    de: 'Google-Anmeldung ist derzeit nicht verfügbar.',
    ru: 'Вход через Google временно недоступен.',
    tr: 'Google ile giriş şu anda kullanılamıyor.',
  },
  statusGoogleMissingCredential: {
    en: 'Google Sign-In failed. Missing credential.',
    de: 'Google-Anmeldung fehlgeschlagen. Anmeldedaten fehlen.',
    ru: 'Ошибка входа через Google: отсутствуют данные.',
    tr: 'Google ile giriş başarısız. Kimlik bilgisi eksik.',
  },
  statusGoogleFailed: {
    en: 'Google Sign-In failed. Please try another method.',
    de: 'Google-Anmeldung fehlgeschlagen. Bitte versuchen Sie eine andere Methode.',
    ru: 'Вход через Google не удался. Попробуйте другой способ.',
    tr: 'Google ile giriş başarısız. Lütfen başka bir yöntem deneyin.',
  },
  statusFacebookUnavailable: {
    en: 'Facebook login is not available right now. Please try another method.',
    de: 'Facebook-Anmeldung ist derzeit nicht verfügbar. Bitte versuchen Sie eine andere Methode.',
    ru: 'Вход через Facebook временно недоступен. Попробуйте другой способ.',
    tr: 'Facebook ile giriş şu anda kullanılamıyor. Lütfen başka bir yöntem deneyin.',
  },
  statusFacebookMissingToken: {
    en: 'Facebook login failed. Missing access token.',
    de: 'Facebook-Anmeldung fehlgeschlagen. Zugriffstoken fehlt.',
    ru: 'Ошибка входа через Facebook: отсутствует токен доступа.',
    tr: 'Facebook ile giriş başarısız. Erişim belirteci eksik.',
  },
  statusFacebookInvalidToken: {
    en: 'Facebook login failed. Please try again.',
    de: 'Facebook-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    ru: 'Вход через Facebook не удался. Попробуйте еще раз.',
    tr: 'Facebook ile giriş başarısız. Lütfen tekrar deneyin.',
  },
  statusFacebookMissingEmail: {
    en: 'Facebook did not provide an email. An email address is required to sign in.',
    de: 'Facebook hat keine E-Mail-Adresse bereitgestellt. Eine E-Mail-Adresse ist erforderlich.',
    ru: 'Facebook не предоставил email. Адрес электронной почты обязателен для входа.',
    tr: 'Facebook e-posta sağlamadı. Giriş için e-posta adresi gereklidir.',
  },
  statusFacebookVerificationFailed: {
    en: 'We couldn’t verify your Facebook login. Please try again.',
    de: 'Wir konnten deine Facebook-Anmeldung nicht verifizieren. Bitte versuche es erneut.',
    ru: 'Не удалось подтвердить вход через Facebook. Попробуйте еще раз.',
    tr: 'Facebook girişinizi doğrulayamadık. Lütfen tekrar deneyin.',
  },
  statusFacebookEmailMismatch: {
    en: 'This Facebook account’s email doesn’t match any existing account.',
    de: 'Die E-Mail dieses Facebook-Kontos stimmt mit keinem bestehenden Konto überein.',
    ru: 'Email этого Facebook-аккаунта не совпадает ни с одной учетной записью.',
    tr: 'Bu Facebook hesabının e-postası mevcut bir hesapla eşleşmiyor.',
  },
  statusAppleUnavailable: {
    en: 'Apple Sign-In is not available yet.',
    de: 'Apple-Anmeldung ist noch nicht verfügbar.',
    ru: 'Вход через Apple пока недоступен.',
    tr: 'Apple ile giriş henüz kullanılamıyor.',
  },
  statusAppleFailedRetry: {
    en: 'Apple Sign-In failed. Please try again.',
    de: 'Apple-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    ru: 'Вход через Apple не удался. Попробуйте еще раз.',
    tr: 'Apple ile giriş başarısız. Lütfen tekrar deneyin.',
  },
  statusAppleFailedAnother: {
    en: 'Apple Sign-In failed. Please try another method.',
    de: 'Apple-Anmeldung fehlgeschlagen. Bitte versuchen Sie eine andere Methode.',
    ru: 'Вход через Apple не удался. Попробуйте другой способ.',
    tr: 'Apple ile giriş başarısız. Lütfen başka bir yöntem deneyin.',
  },
} as const;

type LoginTranslationKey = keyof typeof LOGIN_TRANSLATIONS;

interface LoginCopy {
  title: string;
  subtitle: string;
  googleButton: string;
  facebookButton: string;
  appleButton: string;
  divider: string;
  emailLabel: string;
  emailError: string;
  passwordLabel: string;
  passwordError: string;
  rememberMe: string;
  forgotPassword: string;
  submitIdle: string;
  submitBusy: string;
  footerPrompt: string;
  registerLink: string;
  statusMessages: {
    loginFailed: string;
    googleUnavailable: string;
    googleMissingCredential: string;
    googleFailed: string;
    facebookUnavailable: string;
    facebookMissingToken: string;
    facebookInvalidToken: string;
    facebookMissingEmail: string;
    facebookVerificationFailed: string;
    facebookEmailMismatch: string;
    appleUnavailable: string;
    appleFailedRetry: string;
    appleFailedAnother: string;
  };
}

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SuperHeaderComponent, NavbarComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly form: FormGroup;
  readonly loading = signal(false);
  readonly googleLoading = signal(false);
  readonly facebookLoading = signal(false);
  readonly appleLoading = signal(false);
  readonly statusMessage = signal<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  readonly appleEnabled = this.isAppleConfigured();
  private returnUrl = '/account';
  protected copy: LoginCopy;
  currentLang: AuthLanguageCode | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authApi: AuthApiService,
    private readonly authService: AuthService,
    private readonly socialService: SocialAuthService,
    private readonly languageService: LanguageService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [true],
    });

    const initialLang = this.detectLanguage();
    this.currentLang = initialLang;
    this.copy = this.buildCopy(initialLang);

    this.route.queryParamMap
      .pipe(take(1))
      .subscribe((params) => {
        const paramUrl = params.get('returnUrl');
        if (paramUrl) {
          this.returnUrl = paramUrl;
        } else if (isPlatformBrowser(this.platformId)) {
          const stored = localStorage.getItem('auth.returnUrl');
          if (stored) {
            this.returnUrl = stored;
            localStorage.removeItem('auth.returnUrl');
          }
        }
      });

    if (isPlatformBrowser(this.platformId)) {
      this.socialService.loadGoogle().catch(() => {});
      this.socialService.loadApple();
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.statusMessage.set(null);
    this.loading.set(true);
    const credentials: LoginPayload = {
      email: this.form.value.email,
      password: this.form.value.password,
    };
    this.authApi.login(credentials).subscribe({
      next: (res) => {
        console.log('Login response:', res);
        this.authService.setSession(res);
        console.log('Session set in AuthService');
        this.loading.set(false);
        console.log('Navigating post login to:', this.returnUrl);
        this.navigatePostLogin(res.user);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('auth.returnUrl');
        }
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err?.error?.detail || this.copy.statusMessages.loginFailed;
        this.statusMessage.set({ type: 'error', text: detail });
      },
    });
  }

  async handleGoogleSignIn(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.googleLoading() || this.loading()) {
      return;
    }
    this.googleLoading.set(true);
    try {
      await this.socialService.loadGoogle();
      if (typeof google === 'undefined' || !google?.accounts?.id || !environment.googleClientId) {
        this.googleLoading.set(false);
        this.statusMessage.set({ type: 'info', text: this.copy.statusMessages.googleUnavailable });
        return;
      }
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: { credential: string }) => this.exchangeGoogleCredential(response?.credential),
      });
      google.accounts.id.prompt();
    } catch (error) {
      this.googleLoading.set(false);
      this.statusMessage.set({ type: 'error', text: this.copy.statusMessages.googleFailed });
      console.error('Google sign-in failed to initialize', error);
    }
  }

  async handleFacebookSignIn(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.facebookLoading() || this.loading()) {
      return;
    }
    console.log('[FB] handleFacebookSignIn: start');
    this.facebookLoading.set(true);
    try {
      await this.socialService.loadFacebook();
      console.log('[FB] handleFacebookSignIn: loadFacebook resolved');
      if (typeof FB === 'undefined' || !environment.facebookAppId || !this.socialService.facebookInitialized()) {
        console.warn('[FB] handleFacebookSignIn: SDK not ready', {
          hasFB: typeof FB !== 'undefined',
          appId: environment.facebookAppId,
          initialized: this.socialService.facebookInitialized(),
        });
        this.facebookLoading.set(false);
        this.statusMessage.set({ type: 'info', text: this.copy.statusMessages.facebookUnavailable });
        return;
      }
      console.log('[FB] handleFacebookSignIn: calling FB.login');
      FB.login(
        (response: { authResponse?: { accessToken?: string } }) => {
          console.log('[FB] FB.login callback', response);
          const token = response?.authResponse?.accessToken;
          if (!token) {
            this.facebookLoading.set(false);
            this.statusMessage.set({ type: 'error', text: this.copy.statusMessages.facebookMissingToken });
            return;
          }
          console.log('[FB] handleFacebookSignIn: exchanging token');
          this.exchangeFacebookToken(token);
        },
        { scope: 'email,public_profile' },
      );
    } catch (error) {
      console.error('[FB] handleFacebookSignIn: init failed', error);
      this.facebookLoading.set(false);
      this.statusMessage.set({ type: 'error', text: this.copy.statusMessages.facebookUnavailable });
    }
  }

  handleAppleSignIn(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.appleLoading() || this.loading()) {
      return;
    }
    this.socialService.loadApple();
    if (typeof AppleID === 'undefined' || !AppleID?.auth?.signIn) {
      this.statusMessage.set({ type: 'info', text: this.copy.statusMessages.appleUnavailable });
      return;
    }
    this.appleLoading.set(true);
    AppleID.auth
      .signIn()
      .then((data: any) => {
        const token = data?.authorization?.id_token;
        if (!token) {
          throw new Error('Missing Apple identity token');
        }
        this.exchangeAppleToken(token);
      })
      .catch(() => {
        this.appleLoading.set(false);
        this.statusMessage.set({ type: 'error', text: this.copy.statusMessages.appleFailedRetry });
      });
  }

  private exchangeGoogleCredential(idToken: string | undefined): void {
    if (!idToken) {
      this.googleLoading.set(false);
      this.statusMessage.set({ type: 'error', text: this.copy.statusMessages.googleMissingCredential });
      return;
    }
    this.loading.set(true);
    this.authApi.socialGoogle({ id_token: idToken }).subscribe({
      next: (res) => {
        this.authService.setSession(res);
        this.loading.set(false);
        this.googleLoading.set(false);
        this.navigatePostLogin(res.user);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('auth.returnUrl');
        }
      },
      error: () => {
        this.loading.set(false);
        this.googleLoading.set(false);
        this.statusMessage.set({ type: 'error', text: this.copy.statusMessages.googleFailed });
      },
    });
  }

  private exchangeAppleToken(identityToken: string): void {
    this.loading.set(true);
    this.authApi.socialApple({ identity_token: identityToken }).subscribe({
      next: (res) => {
        this.authService.setSession(res);
        this.loading.set(false);
        this.appleLoading.set(false);
        this.navigatePostLogin(res.user);
      },
      error: () => {
        this.loading.set(false);
        this.appleLoading.set(false);
        this.statusMessage.set({ type: 'error', text: this.copy.statusMessages.appleFailedAnother });
      },
    });
  }

  private exchangeFacebookToken(accessToken: string): void {
    this.loading.set(true);
    this.authApi.socialFacebook({ access_token: accessToken }).subscribe({
      next: (res) => {
        this.authService.setSession(res);
        this.loading.set(false);
        this.facebookLoading.set(false);
        this.navigatePostLogin(res.user);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('auth.returnUrl');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.facebookLoading.set(false);
        const detail = err?.error?.detail;
        this.statusMessage.set({ type: 'error', text: this.resolveFacebookError(detail) });
      },
    });
  }

  private navigatePostLogin(user: AuthUser): void {
    console.log('Navigating post login for user:', user);
    const lang = this.resolvePreferredLang();
    console.log('Current language for navigation:', lang);
    if (this.isAdminUser(user)) {
      console.log('Navigating to admin for privileged user');
      const target = this.returnUrl?.startsWith('/admin') ? this.returnUrl : '/admin';
      this.router.navigateByUrl(target).catch(() => {});
      return;
    }
    const target = this.buildClientTarget(lang);
    console.log('Final navigation target:', target);
    this.router.navigateByUrl(target).catch(() => {});
  }

  private isAdminUser(user: AuthUser | null | undefined): boolean {
    if (!user) {
      return false;
    }
    const role = user.role ?? '';
    return (
      user.is_staff ||
      user.is_company_user ||
      role.startsWith('company_') ||
      role === 'blogger' ||
      role === 'seo' ||
      role === 'admin' ||
      role === 'superuser' ||
      role === 'super_user'
    );
  }

  private resolvePreferredLang(): string | null {
    return (
      this.currentLang ??
      this.languageService.extractLangFromUrl(this.returnUrl ?? '') ??
      this.serviceLangCode() ??
      null
    );
  }

  private buildClientTarget(lang: string | null): string {
    const raw = this.returnUrl?.trim() ?? '';
    if (!raw) {
      return this.languageService.withLangPrefix('account', lang);
    }
    const normalized = raw.startsWith('/') ? raw : `/${raw}`;
    const existingLang = this.languageService.extractLangFromUrl(normalized);
    if (existingLang) {
      return normalized;
    }

    const withoutLeading = normalized.replace(/^\/+/, '');
    if (!withoutLeading) {
      return this.languageService.withLangPrefix('account', lang);
    }
    if (withoutLeading === 'account') {
      return this.languageService.withLangPrefix('account', lang);
    }
    if (withoutLeading.startsWith('account/')) {
      return this.languageService.withLangPrefix(withoutLeading, lang);
    }
    return this.languageService.withLangPrefix(withoutLeading, lang);
  }

  private serviceLangCode(): string | null {
    try {
      const current = this.languageService.currentLang?.();
      return current?.code ?? null;
    } catch {
      return null;
    }
  }

  linkWithLang(path: string): string {
    return this.languageService.withLangPrefix(path, this.currentLang);
  }

  private isAppleConfigured(): boolean {
    const clientId = environment.appleClientId;
    return Boolean(clientId && clientId !== 'YOUR_APPLE_CLIENT_ID' && !clientId.startsWith('TODO'));
  }

  private detectLanguage(): AuthLanguageCode {
    const routeLang = this.route.snapshot.data?.['language'];
    const urlLang = this.languageService.extractLangFromUrl(this.router.url);
    const serviceLang = this.languageService.currentLang?.()?.code ?? null;
    return normalizeAuthLanguage(routeLang ?? urlLang ?? serviceLang ?? null);
  }

  private buildCopy(lang: AuthLanguageCode): LoginCopy {
    return {
      title: this.translate('title', lang),
      subtitle: this.translate('subtitle', lang),
      googleButton: this.translate('googleButton', lang),
      facebookButton: this.translate('facebookButton', lang),
      appleButton: this.translate('appleButton', lang),
      divider: this.translate('divider', lang),
      emailLabel: this.translate('emailLabel', lang),
      emailError: this.translate('emailError', lang),
      passwordLabel: this.translate('passwordLabel', lang),
      passwordError: this.translate('passwordError', lang),
      rememberMe: this.translate('rememberMe', lang),
      forgotPassword: this.translate('forgotPassword', lang),
      submitIdle: this.translate('submitIdle', lang),
      submitBusy: this.translate('submitBusy', lang),
      footerPrompt: this.translate('footerPrompt', lang),
      registerLink: this.translate('registerLink', lang),
      statusMessages: {
        loginFailed: this.translate('statusLoginFailed', lang),
        googleUnavailable: this.translate('statusGoogleUnavailable', lang),
        googleMissingCredential: this.translate('statusGoogleMissingCredential', lang),
        googleFailed: this.translate('statusGoogleFailed', lang),
        facebookUnavailable: this.translate('statusFacebookUnavailable', lang),
        facebookMissingToken: this.translate('statusFacebookMissingToken', lang),
        facebookInvalidToken: this.translate('statusFacebookInvalidToken', lang),
        facebookMissingEmail: this.translate('statusFacebookMissingEmail', lang),
        facebookVerificationFailed: this.translate('statusFacebookVerificationFailed', lang),
        facebookEmailMismatch: this.translate('statusFacebookEmailMismatch', lang),
        appleUnavailable: this.translate('statusAppleUnavailable', lang),
        appleFailedRetry: this.translate('statusAppleFailedRetry', lang),
        appleFailedAnother: this.translate('statusAppleFailedAnother', lang),
      },
    };
  }

  private resolveFacebookError(detail?: string): string {
    switch (detail) {
      case 'facebook_unavailable':
        return this.copy.statusMessages.facebookUnavailable;
      case 'facebook_missing_token':
        return this.copy.statusMessages.facebookMissingToken;
      case 'facebook_invalid_token':
        return this.copy.statusMessages.facebookInvalidToken;
      case 'facebook_missing_email':
        return this.copy.statusMessages.facebookMissingEmail;
      case 'facebook_verification_failed':
        return this.copy.statusMessages.facebookVerificationFailed;
      case 'facebook_email_mismatch':
        return this.copy.statusMessages.facebookEmailMismatch;
      default:
        return this.copy.statusMessages.facebookInvalidToken;
    }
  }

  private translate(key: LoginTranslationKey, lang: AuthLanguageCode): string {
    const entry = LOGIN_TRANSLATIONS[key];
    return entry[lang] ?? entry[AUTH_FALLBACK_LANGUAGE];
  }
}
