import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { LanguageSelectionComponent } from '../language-selection/language-selection.component';
import { CurrencySelectionComponent } from '../currency-selection/currency-selection.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SOCIAL_ICONS } from '../../constants/social.constants';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../auth/services/auth.service';
import { AuthUser } from '../../auth/models/auth.models';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const LANG_PREFIXES = ['en', 'de', 'ru', 'tr'];

@Component({
  selector: 'app-super-header',  
  imports: [
    CommonModule, 
    LanguageSelectionComponent, 
    CurrencySelectionComponent, 
  ],
  templateUrl: './super-header.component.html',
  styleUrl: './super-header.component.scss'
})
export class SuperHeaderComponent implements OnInit {
  @Input() langInput: any | null = null; // Input property for language selection
  @Input() trailingMultilingualBlogSlug: { [key: string]: string } | null = null; // e.g., 'blogs/turkey-airport-transfer-blogs/multilingual-slug'
  socialIcons = SOCIAL_ICONS;
  currentLanguage: any = { code: 'en', name: 'English' };
  dashboardLoading = false;
  private languageService!: LanguageService;
  private authService!: AuthService;
  private router!: Router;
  showDashboardCta = true;


  constructor(private route: ActivatedRoute, private readonly destroyRef: DestroyRef) {
      if (typeof window !== 'undefined') {
        this.languageService = inject(LanguageService);
        this.authService = inject(AuthService);
        this.router = inject(Router);
        this.router.events
          .pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            takeUntilDestroyed(destroyRef)
          )
          .subscribe(event => {
            this.showDashboardCta = !this.isAccountOrAdmin(event.urlAfterRedirects ?? event.url);
          });
      }
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
    this.showDashboardCta = !this.isAccountOrAdmin(this.router?.url ?? '');
  }

  async goToDashboard(): Promise<void> {
    if (this.dashboardLoading) {
      return;
    }
    this.dashboardLoading = true;
    const languageCode = this.currentLanguage?.code ?? 'en';
    const accountTarget = this.languageService?.withLangPrefix('account', languageCode) ?? '/account';
    const user = this.authService?.user() ?? null;
    try {
      if (user && this.isAdminUser(user)) {
        await this.router?.navigateByUrl('/admin').catch(() => {});
        return;
      }
      if (this.authService?.isLoggedIn()) {
        await this.router?.navigateByUrl(accountTarget).catch(() => {});
        return;
      }
      const loginTarget = this.languageService?.withLangPrefix('auth/login', languageCode) ?? '/auth/login';
      await this.router?.navigateByUrl(loginTarget, {
        state: { returnUrl: accountTarget },
      }).catch(() => {});
    } finally {
      this.dashboardLoading = false;
    }
  }

  private isAccountOrAdmin(path: string): boolean {
    if (!path) {
      return false;
    }
    const normalized = path.startsWith('/') ? path.slice(1) : path;
    if (normalized.startsWith('account') || normalized.startsWith('admin')) {
      return true;
    }
    const segments = normalized.split('/');
    if (segments.length > 1 && LANG_PREFIXES.includes(segments[0])) {
      return segments[1] === 'account' || segments[1] === 'admin';
    }
    return false;
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
      role === 'admin' ||
      role === 'superuser' ||
      role === 'super_user'
    );
  }
}
