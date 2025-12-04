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
import { ACCOUNT_FALLBACK_LANGUAGE, AccountLanguageCode, normalizeAccountLanguage } from '../../constants/account-language.constants';

const ACCOUNT_SHELL_TRANSLATIONS = {
  menuLabel: {
    en: 'Menu',
    de: 'Menü',
    ru: 'Меню',
    tr: 'Menü',
  },
  logout: {
    en: 'Logout',
    de: 'Abmelden',
    ru: 'Выйти',
    tr: 'Çıkış yap',
  },
  nav: {
    dashboard: {
      en: 'Dashboard',
      de: 'Dashboard',
      ru: 'Панель',
      tr: 'Panel',
    },
    reservations: {
      en: 'Reservations',
      de: 'Reservierungen',
      ru: 'Бронирования',
      tr: 'Rezervasyonlar',
    },
    reviews: {
      en: 'Reviews',
      de: 'Bewertungen',
      ru: 'Отзывы',
      tr: 'Değerlendirmeler',
    },
    profile: {
      en: 'Profile',
      de: 'Profil',
      ru: 'Профиль',
      tr: 'Profil',
    },
    changePassword: {
      en: 'Change Password',
      de: 'Passwort ändern',
      ru: 'Смена пароля',
      tr: 'Şifre değiştir',
    },
  },
} as const;

interface AccountShellCopy {
  menuLabel: string;
  logout: string;
  nav: {
    dashboard: string;
    reservations: string;
    reviews: string;
    profile: string;
    changePassword: string;
  };
}

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

  private readonly activeLang = computed(() => this.detectLanguage());
  readonly copy = computed(() => this.buildCopy(this.activeLang()));

  readonly navItems = computed(() => {
    const lang = this.activeLang();
    const navCopy = this.copy().nav;
    return [
      { label: navCopy.dashboard, link: this.languageService.withLangPrefix('account', lang), exact: true },
      { label: navCopy.reservations, link: this.languageService.withLangPrefix('account/reservations', lang), exact: false },
      { label: navCopy.reviews, link: this.languageService.withLangPrefix('account/reviews', lang), exact: false },
      { label: navCopy.profile, link: this.languageService.withLangPrefix('account/profile', lang), exact: false },
      { label: navCopy.changePassword, link: this.languageService.withLangPrefix('account/change-password', lang), exact: false },
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

  private detectLanguage(): AccountLanguageCode {
    const urlLang = this.languageService.extractLangFromUrl(this.currentUrl()) ?? null;
    const serviceLang = this.languageService.currentLang?.()?.code ?? null;
    return normalizeAccountLanguage(urlLang ?? serviceLang ?? null);
  }

  private buildCopy(lang: AccountLanguageCode): AccountShellCopy {
    const fallback = ACCOUNT_FALLBACK_LANGUAGE;
    const pick = (entry: Record<AccountLanguageCode, string>): string =>
      entry[lang] ?? entry[fallback];
    const navEntries = ACCOUNT_SHELL_TRANSLATIONS.nav;
    return {
      menuLabel: pick(ACCOUNT_SHELL_TRANSLATIONS.menuLabel),
      logout: pick(ACCOUNT_SHELL_TRANSLATIONS.logout),
      nav: {
        dashboard: pick(navEntries.dashboard),
        reservations: pick(navEntries.reservations),
        reviews: pick(navEntries.reviews),
        profile: pick(navEntries.profile),
        changePassword: pick(navEntries.changePassword),
      },
    };
  }
}
