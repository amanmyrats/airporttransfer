import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, switchMap, catchError, finalize } from 'rxjs/operators';
import { environment as env } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = env.baseUrl;
  private endPoint = 'auth/'
  private refreshInProgress = false;

  private accessTokenSubject: BehaviorSubject<any> = new BehaviorSubject<string>('');
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
    
  ) { 
    this.accessTokenSubject.next(this.currentAccessToken);
    this.refreshTokenSubject.next(this.currentRefreshToken);
  }


  login(email: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.baseUrl}${this.endPoint}api/token/`, { email, password })
      .pipe(
        map(response => {
          console.log(response);
          if (response && response.access) {
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('accessToken', response.access);
              localStorage.setItem('refreshToken', response.refresh);
              localStorage.setItem('userId', response.user_id);
              localStorage.setItem('firstName', response.first_name);
              localStorage.setItem('roleName', response.role);
              localStorage.setItem('isSuperuser', response.is_superuser);
              this.accessTokenSubject.next(response.access);
              this.refreshTokenSubject.next(response.refresh);
              return true;
            }
          }
          return false;
        })
      );
  }
  // refreshToken() {
  //   return this.http.post<any>(
  //     `${this.baseUrl}${this.endPoint}api/token/refresh/`, 
  //     { refresh: this.currentRefreshToken });
  // }

  refreshToken(): Observable<any> {
    console.log('inside: authService.refreshToken()')
    return this.refreshTokenSubject.pipe(
      switchMap(refreshToken => {
        console.log('refreshToken: ' + refreshToken)
        console.log('this.refreshInProgress: ' + this.refreshInProgress)
        if (!refreshToken || this.refreshInProgress) {
          return of(null);
        }
        this.refreshInProgress = true;
        console.log("Sending refresh token.")
        return this.http.post<any>(
          `${this.baseUrl}${this.endPoint}api/token/refresh/`, 
          { refresh: refreshToken })
          .pipe(
            // Use map operator within the projection function
            map(response => {
              if (response && response.access) {
              if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem('accessToken', response.access);
              }  
              this.refreshTokenSubject.next(response.refresh);
              }
              return response;
            }),
            catchError(error => {
              this.logout();
              throw error;
            }),
            finalize(() => {
              this.refreshInProgress = false;
            })
          );
      })
    );
  }

  logout(): void {
                
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('firstName');
      localStorage.removeItem('roleName');
      localStorage.removeItem('isSuperuser');
      this.accessTokenSubject.next('');
      this.refreshTokenSubject.next('');
    }
  }

  public get currentAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
      // Access the current value using getValue()
      // return this.accessTokenSubject.getValue();
    }
    return null;
  }

  setAccessToken(accessToken: string): void {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.setItem('accessToken', accessToken);
    }
  }

  
  public get currentRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('refreshToken');
      // Access the current value using getValue()
      // return this.refreshTokenSubject.getValue();
    }
    return null;
  }

  public get accessTokenChanges(): Observable<string> {
    return this.accessTokenSubject.asObservable();
  }

  isLoggedIn(): boolean {
    return !!this.currentAccessToken;
  }

  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${this.endPoint}changepassword/`, 
      { old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword});
  }
}

// import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable, of } from 'rxjs';
// import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
// import { isPlatformBrowser } from '@angular/common';
// import { environment as env } from '../../environments/environment';

// interface LoginResponse {
//   access: string;
//   refresh: string;
//   user_id?: string;
//   first_name?: string;
//   role?: string;
//   is_superuser?: boolean;
// }

// interface RefreshResponse {
//   access: string;
// }

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private baseUrl = env.baseUrl;
//   private endPoint = 'auth/';

//   private accessTokenSubject = new BehaviorSubject<string>('');
//   private refreshTokenSubject = new BehaviorSubject<string | null>(null);

//   /** Shared in-flight refresh observable (cleared on complete/error) */
//   private refreshInFlight$?: Observable<string | null>;

//   constructor(
//     private http: HttpClient,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     // Initialize subjects from storage (SSR-safe)
//     const access = this.currentAccessToken;
//     const refresh = this.currentRefreshToken;
//     if (access) this.accessTokenSubject.next(access);
//     this.refreshTokenSubject.next(refresh);
//   }

//   /** ---- Auth API ---- */

//   login(email: string, password: string): Observable<boolean> {
//     return this.http
//       .post<LoginResponse>(`${this.baseUrl}${this.endPoint}api/token/`, { email, password })
//       .pipe(
//         map(res => {
//           if (res?.access && res?.refresh) {
//             this.setTokens(res.access, res.refresh);
//             // Optional user metadata
//             this.safeSet('userId', String(res.user_id ?? ''));
//             this.safeSet('firstName', String(res.first_name ?? ''));
//             this.safeSet('roleName', String(res.role ?? ''));
//             this.safeSet('isSuperuser', String(res.is_superuser ?? ''));
//             return true;
//           }
//           return false;
//         })
//       );
//   }

//   /**
//    * Returns a shared observable that emits a fresh access token (string),
//    * or null if refresh failed or not available. Only one network call runs at a time.
//    */
//   refreshAccessTokenOnce(): Observable<string | null> {
//     if (this.refreshInFlight$) return this.refreshInFlight$;

//     const refresh = this.currentRefreshToken;
//     if (!refresh) return of(null);

//     const req$ = this.http
//       .post<RefreshResponse>(`${this.baseUrl}${this.endPoint}api/token/refresh/`, { refresh })
//       .pipe(
//         map(res => {
//           const newAccess = res?.access ?? null;
//           if (newAccess) {
//             this.safeSet('accessToken', newAccess);
//             this.accessTokenSubject.next(newAccess);
//           }
//           return newAccess;
//         }),
//         catchError(() => of(null)),
//         shareReplay(1),
//         finalize(() => {
//           // allow next refresh attempt
//           this.refreshInFlight$ = undefined;
//         })
//       );

//     this.refreshInFlight$ = req$;
//     return req$;
//   }

//   logout(): void {
//     // Clear tokens & metadata
//     this.safeRemove('accessToken');
//     this.safeRemove('refreshToken');
//     this.safeRemove('userId');
//     this.safeRemove('firstName');
//     this.safeRemove('roleName');
//     this.safeRemove('isSuperuser');

//     // Reset subjects
//     this.accessTokenSubject.next('');
//     this.refreshTokenSubject.next(null);
//   }

//   /** ---- Token helpers ---- */

//   setTokens(access: string, refresh?: string): void {
//     this.safeSet('accessToken', access);
//     this.accessTokenSubject.next(access);

//     if (refresh !== undefined) {
//       this.safeSet('refreshToken', refresh);
//       this.refreshTokenSubject.next(refresh);
//     }
//   }

//   setAccessToken(accessToken: string): void {
//     this.safeSet('accessToken', accessToken);
//     this.accessTokenSubject.next(accessToken);
//   }

//   get currentAccessToken(): string | null {
//     return this.safeGet('accessToken');
//   }

//   get currentRefreshToken(): string | null {
//     return this.safeGet('refreshToken');
//   }

//   get hasRefreshToken(): boolean {
//     return !!this.currentRefreshToken;
//   }

//   /** Emits whenever access token changes */
//   get accessTokenChanges(): Observable<string> {
//     return this.accessTokenSubject.asObservable();
//   }

//   isLoggedIn(): boolean {
//     return !!this.currentAccessToken;
//   }

//   /** ---- Other API ---- */

//   changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
//     return this.http.post<any>(
//       `${this.baseUrl}${this.endPoint}changepassword/`,
//       { old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword }
//     );
//   }

//   /** ---- Storage (SSR-safe) ---- */

//   private safeGet(key: string): string | null {
//     if (!isPlatformBrowser(this.platformId)) return null;
//     try { return localStorage.getItem(key); } catch { return null; }
//   }

//   private safeSet(key: string, value: string): void {
//     if (!isPlatformBrowser(this.platformId)) return;
//     try { localStorage.setItem(key, value); } catch {}
//   }

//   private safeRemove(key: string): void {
//     if (!isPlatformBrowser(this.platformId)) return;
//     try { localStorage.removeItem(key); } catch {}
//   }
// }
