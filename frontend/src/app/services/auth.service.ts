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
