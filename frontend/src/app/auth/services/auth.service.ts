import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthApiService } from './auth-api.service';
import {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  UpdateProfilePayload,
} from '../models/auth.models';

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
      const normalized = this.normalizeUser(user);
      if (normalized) {
        this.user.set(normalized);
      }
    }
    this.bootstrapped = true;
  }

  setSession(response: LoginResponse): void {
    const normalizedUser = this.normalizeUser(response.user);
    this.accessToken.set(response.access);
    this.refreshToken.set(response.refresh);
    if (normalizedUser) {
      this.persistUser(normalizedUser);
    }
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.access, response.access);
      localStorage.setItem(STORAGE_KEYS.refresh, response.refresh);
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
      localStorage.removeItem('isSuperuser');
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
      tap(res => this.setSession(res)),
      map(() => true),
    );
  }

  loginWithResponse(payload: LoginPayload): Observable<LoginResponse> {
    return this.authApi.login(payload).pipe(tap(res => this.setSession(res)));
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
      tap(res => {
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
      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      }),
      map(res => {
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
      }),
    );
    this.refreshInFlight = refresh$;
    return refresh$;
  }

  logout(): Observable<void> {
    const refresh = this.refreshToken();
    const apiCall = refresh
      ? this.authApi.logout(refresh).pipe(catchError(() => of({ detail: 'ok' })))
      : of({ detail: 'ok' });
    return apiCall.pipe(
      map(() => {
        this.clearSession();
      }),
    );
  }

  loadMe(): Observable<AuthUser | null> {
    if (!this.accessToken()) {
      return of(null);
    }
    return this.authApi.me().pipe(
      tap(user => {
        const normalized = this.normalizeUser(user);
        if (normalized) {
          this.persistUser(normalized);
        }
      }),
      map(user => user),
      catchError(error => {
        if (error?.status === 401) {
          this.clearSession();
        }
        return of(null);
      }),
    );
  }

  updateMe(body: UpdateProfilePayload): Observable<AuthUser> {
    return this.authApi.updateMe(body).pipe(
      tap(user => {
        const normalized = this.normalizeUser(user);
        if (normalized) {
          this.persistUser(normalized);
        }
      }),
    );
  }

  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post<any>(`${this.authBase}password/change/`, {
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

  private normalizeUser(user: (AuthUser & { profile?: AuthUser['customer_profile'] }) | AuthUser | null | undefined): AuthUser | null {
    if (!user) {
      return null;
    }
    const customerProfile = user.customer_profile ?? user.profile ?? null;
    return {
      ...user,
      customer_profile: customerProfile ?? undefined,
      profile: customerProfile ?? undefined,
    };
  }

  private persistUser(user: AuthUser): void {
    this.user.set(user);
    if (!this.isBrowser()) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    localStorage.setItem('userId', String(user.id ?? ''));
    localStorage.setItem('email', user.email ?? '');
    localStorage.setItem('firstName', user.first_name ?? '');
    localStorage.setItem('roleName', user.role ?? '');
    localStorage.setItem('isStaff', String(user.is_staff ?? false));
    localStorage.setItem('profile', JSON.stringify(user.customer_profile ?? {}));
    localStorage.setItem('isSuperuser', String(user.is_superuser ?? false));
  }
}
