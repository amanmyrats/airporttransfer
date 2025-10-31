import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../../services/auth.service';
import { take } from 'rxjs/operators';
import { LanguageService } from '../../../services/language.service';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly authService: AuthService,
    private readonly languageService: LanguageService,
  ) {
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const token = params.get('id_token');
      if (!token) {
        this.processing.set(false);
        this.statusMessage.set('Apple sign-in failed: missing identity token.');
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
          this.statusMessage.set('Apple sign-in failed. Please try again.');
          const lang = this.languageService.extractLangFromUrl(this.router.url);
          const target = this.languageService.withLangPrefix('auth/login', lang);
          this.router.navigateByUrl(target).catch(() => {});
        },
      });
    });
  }
}
