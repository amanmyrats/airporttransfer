import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  SocialApplePayload,
  SocialGooglePayload,
  UpdateProfilePayload,
  VerifyEmailPayload,
  AuthUser,
  RefreshResponse,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authBase = (environment.authBase ?? `${environment.apiBase}/auth`).replace(/\/?$/, '/');

  register(body: RegisterPayload): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.authBase}register/`, body);
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authBase}login/`, payload);
  }

  refresh(refresh: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.authBase}token/refresh/`, { refresh });
  }

  logout(refresh: string): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.authBase}logout/`, { refresh });
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.authBase}me/`);
  }

  updateMe(body: UpdateProfilePayload): Observable<AuthUser> {
    return this.http.patch<AuthUser>(`${this.authBase}me/`, body);
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.authBase}password/forgot/`, payload);
  }

  resetPassword(payload: ResetPasswordPayload): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.authBase}password/reset/confirm/`, payload);
  }

  verifyEmail(payload: VerifyEmailPayload): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.authBase}email/verify/`, payload);
  }

  socialGoogle(payload: SocialGooglePayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authBase}social/google/`, payload);
  }

  socialApple(payload: SocialApplePayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authBase}social/apple/`, payload);
  }

  hasWindow(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
