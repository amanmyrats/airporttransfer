import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../auth/services/auth.service';
import { LanguageService } from '../../../services/language.service';
import { filter, map, startWith } from 'rxjs/operators';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-account-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './account-shell.component.html',
  styleUrl: './account-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  readonly mobileMenuOpen = signal(false);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects ?? event.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly navItems = computed(() => {
    const lang = this.languageService.extractLangFromUrl(this.currentUrl()) ?? null;
    return [
      { label: 'Dashboard', link: this.languageService.withLangPrefix('account', lang), exact: true },
      { label: 'Reservations', link: this.languageService.withLangPrefix('account/reservations', lang), exact: false },
      { label: 'Reviews', link: this.languageService.withLangPrefix('account/reviews', lang), exact: false },
      { label: 'Profile', link: this.languageService.withLangPrefix('account/profile', lang), exact: false },
      { label: 'Change Password', link: this.languageService.withLangPrefix('account/change-password', lang), exact: false },
    ];
  });

  readonly user = this.authService.user;

  private readonly autoCloseNav = effect(() => {
    this.currentUrl();
    this.mobileMenuOpen.set(false);
  });

  toggleMobileNav(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  closeMobileNav(): void {
    if (this.mobileMenuOpen()) {
      this.mobileMenuOpen.set(false);
    }
  }

  logout(): void {
    this.closeMobileNav();
    this.authService.logout().subscribe({
      next: () => {
        const lang = this.languageService.extractLangFromUrl(this.router.url);
        const target = this.languageService.withLangPrefix('auth/login', lang);
        this.router.navigateByUrl(target).catch(() => {});
      },
      error: () => {
        const lang = this.languageService.extractLangFromUrl(this.router.url);
        const target = this.languageService.withLangPrefix('auth/login', lang);
        this.router.navigateByUrl(target).catch(() => {});
      },
    });
  }
}
