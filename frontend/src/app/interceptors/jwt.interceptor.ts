import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';

let redirectingToLogin = false; // shared flag across interceptor calls

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  // const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzE4OTU4NzcyLCJpYXQiOjE3MTg5NTg0NzIsImp0aSI6ImM3ZGU1ZGIxMmRlOTQzOTJhNTFhNGIwZjExMDA5YmFjIiwidXNlcl9pZCI6MX0.e_OJtMJVQ_FNhGvm3uvMVToJ7RBi5vDOefG5IAUFjno'
  const authToken = authService.currentAccessToken;
  const router = inject(Router);

  // Clone the request and add the authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`
    }
  });
  console.log('Added access token to request');
  console.log('Bearer: ' + authToken);
  console.log(authReq);

  // Pass the cloned request with the updated header to the next handler
  return next(authReq).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {

        // Handle HTTP errors
        if (err.status === 401) {
          if (!redirectingToLogin) {
            redirectingToLogin = true; // prevent further redirects

          // Specific handling for unauthorized errors         
          console.error('Inside jwt.interceptor: Unauthorized request:', err);
          const redirectUrl = getAddressBarUrl(router);
          authService.logout();
          if (redirectUrl.startsWith('/admin/login')) {
            console.warn('Already on login page, not redirecting again');
            redirectingToLogin = false; // reset flag
            return throwError(() => err);
          }
          router.navigate(['admin/login'], { queryParams: { returnUrl: redirectUrl } })
          .finally(() => {
            redirectingToLogin = false; // reset after navigation finishes
          });
        }
          // Check for refresh method in AuthService
          // if (authService.refreshToken && !!authToken) {
          //   console.log("Inside: interceptor -> authService.refreshToken")
          //   return authService.refreshToken().pipe(
          //     switchMap((response) => {
          //       if (response && response.access) {
          //         // Update access token
          //         authService.setAccessToken(response.access);
          //         // Retry with new access token
          //         const refreshedReq = req.clone({
          //           setHeaders: { Authorization: `Bearer ${response.access}` },
          //         });
          //         return next(refreshedReq);
          //       }
          //       return throwError('Refresh token failed'); // Handle refresh failure
          //     })
          //   );
          // } else {
          //     // No refresh method, handle expired token (e.g., logout)
          //     authService.logout();
          //     return throwError('Unauthorized: Token may have expired');
          // }

        } else {
          // Handle other HTTP error codes
          console.error('HTTP error:', err);

        }
      } else {
        // Handle non-HTTP errors
        console.error('An error occurred:', err);
      }

      // Re-throw the error to propagate it further
      return throwError(() => err); 
    })
  );

  
};


// // @Injectable()
// // export class JwtInterceptor implements HttpInterceptor {
// //   private isRefreshing = false;
// //   private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

// //   constructor(private authService: AuthService) {}

// //   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
// //     const accessToken = this.authService.currentAccessToken;
// //     if (accessToken) {
// //       request = this.addToken(request, accessToken);
// //       console.log('Added token to request');
// //       console.log(request);
// //     }

// //     return next.handle(request).pipe(
// //       catchError(error => {
// //         if (error instanceof HttpErrorResponse && error.status === 401) {
// //             console.log('Handling 401 error');
// //           return this.handle401Error(request, next);
// //         } else {
// //           return throwError(error);
// //         }
// //       })
// //     );
// //   }

// //   private addToken(request: HttpRequest<any>, token: string) {
// //     return request.clone({
// //       setHeaders: {
// //         Authorization: `Bearer ${token}`
// //       }
// //     });
// //   }

// //   private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
// //     if (!this.isRefreshing) {
// //       this.isRefreshing = true;
// //       this.refreshTokenSubject.next(null);

// //       return this.authService.refreshToken().pipe(
// //         switchMap((token: any) => {
// //           this.isRefreshing = false;
// //           this.refreshTokenSubject.next(token.access);
// //           return next.handle(this.addToken(request, token.access));
// //         }),
// //         catchError((error) => {
// //           this.isRefreshing = false;
// //           this.authService.logout();
// //           return throwError(error);
// //         })
// //       );
// //     } else {
// //       return this.refreshTokenSubject.pipe(
// //         filter(token => token != null),
// //         take(1),
// //         switchMap(jwt => {
// //           return next.handle(this.addToken(request, jwt));
// //         })
// //       );
// //     }
// //   }



// import { inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import { catchError, switchMap, take, throwError } from 'rxjs';

// const RETURN_URL_KEY = 'auth.returnUrl';
// const LOGIN_PATH = '/admin/login';

// // Your real auth endpoints
// const AUTH_PATTERNS = [
//   /\/auth\/api\/token\/?$/i,
//   /\/auth\/api\/token\/refresh\/?$/i,
//   /\/auth\/login\b/i
// ];
// const isAuthUrl = (url: string) => AUTH_PATTERNS.some(rx => rx.test(url));

// /** Skip static assets */
// const STATIC_EXT = /\.(png|jpe?g|webp|gif|svg|ico|css|js|map|woff2?|ttf|eot)$/i;
// const isStatic = (url: string) => url.includes('/assets/') || STATIC_EXT.test(url);

// export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
//   const auth = inject(AuthService);
//   const router = inject(Router);
//   const platformId = inject(PLATFORM_ID);
//   const inBrowser = isPlatformBrowser(platformId);

//   // Skip auth endpoints & static files
//   if (isAuthUrl(req.url) || isStatic(req.url)) {
//     return next(req);
//   }

//   const token = auth.currentAccessToken;
//   const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
//   console.log(`JWT Interceptor: Adding token to request ${req.url}`);
//   console.log(`JWT Interceptor: Adding token to request ${req.url}`);
//   console.log(`JWT Interceptor: Adding token to request ${req.url}`);
//   console.log(`JWT Interceptor: Adding token to request ${req.url}`);
//   console.log(`JWT Interceptor: Bearer token: ${token}`);


//   return next(authReq).pipe(
//     catchError((err: unknown) => {
//       console.warn(`JWT Interceptor: Error processing request ${req.url}`);
//       console.log('error:', err);
//       console.log("err instanceof HttpErrorResponse:", err instanceof HttpErrorResponse);
//       if (!(err instanceof HttpErrorResponse)) {return throwError(() => err);}
//       if (err.status !== 401) return throwError(() => err);

//       // Current visible URL from address bar
//       const currentUrl = inBrowser ? getAddressBarUrl(router) : router.url;
//       console.warn(`JWT Interceptor: Unauthorized request to ${req.url}`);
//       console.warn(`JWT Interceptor: Unauthorized request to ${req.url}`);
//       console.warn(`JWT Interceptor: Unauthorized request to ${req.url}`);
//       console.warn(`JWT Interceptor: Unauthorized request to ${req.url}`);
//       console.log('currentUrl:', currentUrl);

//       // Store returnUrl every time unless it's the login page
//       if (inBrowser) persistReturnUrl(currentUrl);

//       // No refresh available
//       if (!auth.hasRefreshToken) {
//         auth.logout();
//         router.navigate([LOGIN_PATH], { queryParams: { returnUrl: currentUrl } });
//         return throwError(() => err);
//       }

//       // Try refresh
//       return auth.refreshAccessTokenOnce().pipe(
//         take(1),
//         switchMap((newAccess) => {
//           if (!newAccess) {
//             auth.logout();
//             router.navigate([LOGIN_PATH], { queryParams: { returnUrl: currentUrl } });
//             return throwError(() => err);
//           }
//           // Retry with fresh token
//           const retried = req.clone({ setHeaders: { Authorization: `Bearer ${newAccess}` } });
//           return next(retried);
//         }),
//         catchError((refreshErr) => {
//           auth.logout();
//           router.navigate([LOGIN_PATH], { queryParams: { returnUrl: currentUrl } });
//           return throwError(() => refreshErr);
//         })
//       );
//     })
//   );
// };

function getAddressBarUrl(router: Router): string {
  try {
    const { pathname, search, hash } = window.location;
    const url = `${pathname}${search}${hash || ''}`;
    console.log(`Address bar URL: ${url}`);
    return url || router.url;
  } catch {
    console.log('router.url:', router.url);
    return router.url;

  }
}

// function persistReturnUrl(url: string) {
//   if (!url || url.startsWith(LOGIN_PATH)) return;
//   try {
//     const existing = sessionStorage.getItem(RETURN_URL_KEY);
//     console.log(`Persisting returnUrl: ${url}`);
//     if (existing !== url) {
//       sessionStorage.setItem(RETURN_URL_KEY, url);
//       console.log(`Stored returnUrl: ${url}`);
//     }
//   } catch {
//     /* ignore storage errors */
//   }
// }
