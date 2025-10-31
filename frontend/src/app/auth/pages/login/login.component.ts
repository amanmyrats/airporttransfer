import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../../services/auth.service';
import { LoginPayload } from '../../models/auth.models';
import { SocialAuthService } from '../../services/social-auth.service';
import { take } from 'rxjs/operators';
import { LanguageService } from '../../../services/language.service';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

declare const google: any;
declare const AppleID: any;

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
  readonly statusMessage = signal<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  private returnUrl = '/account';
  currentLang: string | null = null;

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

    this.currentLang = this.languageService.extractLangFromUrl(this.router.url);

    if (isPlatformBrowser(this.platformId)) {
      this.socialService.loadGoogle();
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
        this.navigatePostLogin(res.user.role);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('auth.returnUrl');
        }
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err?.error?.detail || 'Login failed. Please check your credentials and try again.';
        this.statusMessage.set({ type: 'error', text: detail });
      },
    });
  }

  handleGoogleSignIn(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.socialService.loadGoogle();
    if (typeof google === 'undefined' || !environment.googleClientId) {
      this.statusMessage.set({ type: 'info', text: 'Google Sign-In is not available at the moment.' });
      return;
    }
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => this.exchangeGoogleCredential(response?.credential),
    });
    google.accounts.id.prompt();
  }

  handleAppleSignIn(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.socialService.loadApple();
    if (typeof AppleID === 'undefined' || !AppleID?.auth?.signIn) {
      this.statusMessage.set({ type: 'info', text: 'Apple Sign-In is not available yet.' });
      return;
    }
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
        this.statusMessage.set({ type: 'error', text: 'Apple Sign-In failed. Please try again.' });
      });
  }

  private exchangeGoogleCredential(idToken: string | undefined): void {
    if (!idToken) {
      this.statusMessage.set({ type: 'error', text: 'Google Sign-In failed. Missing credential.' });
      return;
    }
    this.loading.set(true);
    this.authApi.socialGoogle({ id_token: idToken }).subscribe({
      next: (res) => {
        this.authService.setSession(res);
        this.loading.set(false);
        this.navigatePostLogin(res.user.role);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('auth.returnUrl');
        }
      },
      error: () => {
        this.loading.set(false);
        this.statusMessage.set({ type: 'error', text: 'Google Sign-In failed. Please try another method.' });
      },
    });
  }

  private exchangeAppleToken(identityToken: string): void {
    this.loading.set(true);
    this.authApi.socialApple({ identity_token: identityToken }).subscribe({
      next: (res) => {
        this.authService.setSession(res);
        this.loading.set(false);
        this.navigatePostLogin(res.user.role);
      },
      error: () => {
        this.loading.set(false);
        this.statusMessage.set({ type: 'error', text: 'Apple Sign-In failed. Please try another method.' });
      },
    });
  }

  private navigatePostLogin(role: string): void {
    console.log('Navigating post login for role:', role);
    const lang = this.currentLang;
    console.log('Current language for navigation:', lang);
    if (role?.startsWith('company_')) {
      console.log('Navigating to admin for company user');
      this.router.navigate(['/admin']).catch(() => {});
      return;
    }
    const target = this.returnUrl || this.languageService.withLangPrefix('account', lang);
    console.log('Final navigation target:', target);
    this.router.navigateByUrl(target).catch(() => {});
  }

  linkWithLang(path: string): string {
    return this.languageService.withLangPrefix(path, this.currentLang);
  }
}
