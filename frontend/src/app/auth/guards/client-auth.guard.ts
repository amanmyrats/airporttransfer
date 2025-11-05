import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../../services/language.service';

export const ClientAuthGuard: CanActivateFn = async (_, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const language = inject(LanguageService);

  await auth.ensureSessionInitialized();

  if (!auth.isLoggedIn()) {
    const url = state.url || '/';
    const lang = language.extractLangFromUrl(url);
    return router.createUrlTree(language.commandsWithLang(lang, 'auth', 'login'), {
      queryParams: { returnUrl: url },
    });
  }

  const user = auth.user();
  if (user?.is_client || user?.role === 'client') {
    return true;
  }

  // company/admin accounts should use the admin portal instead
  if (user?.is_company_user || user?.is_staff) {
    return router.createUrlTree(['/admin']);
  }

  const url = state.url || '/';
  const lang = language.extractLangFromUrl(url);
  return router.createUrlTree(language.commandsWithLang(lang, 'auth', 'login'), {
    queryParams: { returnUrl: url },
  });
};
