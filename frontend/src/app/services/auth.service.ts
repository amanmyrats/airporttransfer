import { Injectable, PLATFORM_ID, inject, computed, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthApiService } from '../auth/services/auth-api.service';
import {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  UpdateProfilePayload,
} from '../auth/models/auth.models';

const STORAGE_KEYS = {
  access: 'auth.accessToken',
  refresh: 'auth.refreshToken',
  user: 'auth.user',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authApi = inject(AuthApiService);
  private readonly http = inject(HttpClient);

  readonly user = signal<AuthUser | null>(null);
  readonly accessToken = signal<string | null>(null);
  readonly refreshToken = signal<string | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessToken());

  private refreshInFlight: Observable<LoginResponse | null> | null = null;
  private readonly authBase = (environment.authBase ?? `${environment.apiBase}/auth`).replace(/\/?$/, '/');
  private bootstrapped = false;

  constructor() {
    this.bootstrapFromStorage();
  }

  bootstrapFromStorage(): void {
    if (!this.isBrowser()) {
      return;
    }
    const access = localStorage.getItem(STORAGE_KEYS.access);
    const refresh = localStorage.getItem(STORAGE_KEYS.refresh);
    const userRaw = localStorage.getItem(STORAGE_KEYS.user);
    const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
    if (access) {
      this.accessToken.set(access);
    }
    if (refresh) {
      this.refreshToken.set(refresh);
    }
    if (user) {
      this.user.set(user);
    }
    this.bootstrapped = true;
  }

  setSession(response: LoginResponse): void {
    console.log('Setting session with response:', response);
    this.accessToken.set(response.access);
    console.log('Access token set to:', response.access);
    this.refreshToken.set(response.refresh);
    console.log('Refresh token set to:', response.refresh);
    this.user.set(response.user);
    console.log('User set to:', response.user);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.access, response.access);
      localStorage.setItem(STORAGE_KEYS.refresh, response.refresh);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));
      localStorage.setItem('userId', String(response.user.id ?? ''));
      localStorage.setItem('email', response.user.email ?? '');
      localStorage.setItem('firstName', response.user.first_name ?? '');
      localStorage.setItem('roleName', response.user.role ?? '');
      localStorage.setItem('isStaff', String(response.user.is_staff ?? false));
      localStorage.setItem('profile', JSON.stringify(response.user.customer_profile ?? {}));
    }
  }

  clearSession(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.user.set(null);
    if (this.isBrowser()) {
      localStorage.removeItem(STORAGE_KEYS.access);
      localStorage.removeItem(STORAGE_KEYS.refresh);
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      localStorage.removeItem('firstName');
      localStorage.removeItem('roleName');
      localStorage.removeItem('isStaff');
      localStorage.removeItem('profile');
    }
  }

  async ensureSessionInitialized(): Promise<void> {
    if (!this.bootstrapped) {
      this.bootstrapFromStorage();
    }
    if (this.currentAccessToken && !this.user()) {
      try {
        await firstValueFrom(this.loadMe());
      } catch {
        // swallow errors; invalid tokens will clear session inside loadMe
      }
    }
  }

  login(email: string, password: string): Observable<boolean> {
    const payload: LoginPayload = { email, password };
    return this.authApi.login(payload).pipe(
      tap((res) => this.setSession(res)),
      map(() => true)
    );
  }

  loginWithResponse(payload: LoginPayload): Observable<LoginResponse> {
    return this.authApi.login(payload).pipe(tap((res) => this.setSession(res)));
  }

  register(payload: RegisterPayload): Observable<{ detail: string }> {
    return this.authApi.register(payload);
  }

  refreshTokens(): Observable<LoginResponse | null> {
    const refresh = this.refreshToken();
    if (!refresh) {
      return of(null);
    }
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }
    const refresh$ = this.authApi.refresh(refresh).pipe(
      tap((res) => {
        const nextRefresh = res.refresh ?? refresh;
        const nextUser = res.user ?? this.user();
        if (res.user) {
          this.setSession({ access: res.access, refresh: nextRefresh, user: res.user });
          return;
        }
        if (nextUser) {
          this.setSession({ access: res.access, refresh: nextRefresh, user: nextUser });
          return;
        }
        this.accessToken.set(res.access);
        this.refreshToken.set(nextRefresh);
        if (this.isBrowser()) {
          localStorage.setItem(STORAGE_KEYS.access, res.access);
          localStorage.setItem(STORAGE_KEYS.refresh, nextRefresh);
        }
      }),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      }),
      map((res) => {
        const nextUser = res.user ?? this.user();
        if (!nextUser) {
          return null;
        }
        return {
          access: res.access,
          refresh: res.refresh ?? refresh,
          user: nextUser,
        } as LoginResponse;
      }),
      finalize(() => {
        this.refreshInFlight = null;
      })
    );
    this.refreshInFlight = refresh$;
    return refresh$;
  }

  logout(): Observable<void> {
    const refresh = this.refreshToken();
    const apiCall = refresh ? this.authApi.logout(refresh).pipe(catchError(() => of({ detail: 'ok' }))) : of({ detail: 'ok' });
    return apiCall.pipe(
      map(() => {
        this.clearSession();
      })
    );
  }

  loadMe(): Observable<AuthUser | null> {
    if (!this.accessToken()) {
      return of(null);
    }
    return this.authApi.me().pipe(
      tap((user) => {
        this.user.set(user);
        if (this.isBrowser()) {
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
          localStorage.setItem('userId', String(user.id ?? ''));
          localStorage.setItem('email', user.email ?? '');
          localStorage.setItem('firstName', user.first_name ?? '');
          localStorage.setItem('roleName', user.role ?? '');
          localStorage.setItem('isStaff', String(user.is_staff ?? false));
          localStorage.setItem('profile', JSON.stringify(user.customer_profile ?? {}));
        }
      }),
      map((user) => user),
      catchError((error) => {
        if (error?.status === 401) {
          this.clearSession();
        }
        return of(null);
      })
    );
  }

  updateMe(body: UpdateProfilePayload): Observable<AuthUser> {
    return this.authApi.updateMe(body).pipe(
      tap((user) => {
        this.user.set(user);
        if (this.isBrowser()) {
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
        }
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post<any>(`${this.authBase}changepassword/`, {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
  }

  isLoggedIn(): boolean {
    return !!this.accessToken();
  }

  get currentAccessToken(): string | null {
    return this.accessToken();
  }

  get currentRefreshToken(): string | null {
    return this.refreshToken();
  }

  setAccessToken(accessToken: string): void {
    this.accessToken.set(accessToken);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.access, accessToken);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
