import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { take } from 'rxjs/operators';
import { LanguageService } from '../../../services/language.service';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

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
  private currentLang: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authApi: AuthApiService,
    private readonly router: Router,
    private readonly languageService: LanguageService,
  ) {
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const key = params.get('key');
      if (!key) {
        this.loading.set(false);
        this.success.set(false);
        this.errorMessage.set('Verification token is missing or invalid.');
        return;
      }
      this.currentLang = this.languageService.extractLangFromUrl(this.router.url);
      this.authApi.verifyEmail({ key }).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.success.set(false);
          this.errorMessage.set('Verification failed. The link may have expired.');
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
}
