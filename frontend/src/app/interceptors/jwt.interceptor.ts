import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../environments/environment';

const STATIC_EXT = /\.(png|jpe?g|gif|svg|ico|css|js|map|woff2?|ttf|eot)$/i;
const isStatic = (url: string) => url.includes('/assets/') || STATIC_EXT.test(url);
const AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/token/refresh',
  '/auth/password/forgot',
  '/auth/password/reset',
  '/auth/email/verify',
];

function isAuthRequest(req: HttpRequest<unknown>): boolean {
  const url = req.url.split('?')[0];
  return AUTH_PATHS.some(path => url.endsWith(path) || url.includes(`${path}/`));
}

function shouldAttachToken(url: string): boolean {
  const apiBase = environment.apiBase?.replace(/\/$/, '');
  if (!apiBase) {
    return false;
  }
  if (url.startsWith('http')) {
    return url.startsWith(apiBase);
  }
  return url.startsWith(apiBase) || url.startsWith('/api/') || url.startsWith('api/');
}

function storeReturnUrl(router: Router, platformId: Object): void {
  if (!isPlatformBrowser(platformId)) {
    return;
  }
  try {
    const urlTree = router.parseUrl(router.url);
    const returnUrl = urlTree.toString() || '/';
    localStorage.setItem('auth.returnUrl', returnUrl);
  } catch {
    // ignore storage errors
  }
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const inBrowser = isPlatformBrowser(platformId);

  if (isStatic(req.url) || isAuthRequest(req)) {
    return next(req);
  }

  const attachToken = shouldAttachToken(req.url);
  const token = attachToken ? auth.currentAccessToken : null;
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !auth.currentRefreshToken) {
        if (error.status === 401 && inBrowser) {
          storeReturnUrl(router, platformId);
          auth.clearSession();
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url },
          }).catch(() => {});
        }
        return throwError(() => error);
      }

      return auth.refreshTokens().pipe(
        switchMap((res) => {
          if (!res?.access) {
            storeReturnUrl(router, platformId);
            auth.clearSession();
            router.navigate(['/auth/login'], {
              queryParams: { returnUrl: router.url },
            }).catch(() => {});
            return throwError(() => error);
          }
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${res.access}` },
          });
          return next(retryReq);
        }),
        catchError((refreshError) => {
          auth.clearSession();
          storeReturnUrl(router, platformId);
          if (inBrowser) {
            router.navigate(['/auth/login'], {
              queryParams: { returnUrl: router.url },
            }).catch(() => {});
          }
          return throwError(() => refreshError);
        })
      );
    })
  );
};
