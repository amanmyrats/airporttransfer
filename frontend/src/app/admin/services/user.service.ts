import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { PasswordReset } from '../../models/password-reset.model';
import { PasswordResetConfirm } from '../../models/password-reset-confirm.model';
import { User } from '../models/user.model';
import { UserChangePassword } from '../models/user-change-password.model';

@Injectable({
  providedIn: 'root', 
})
export class UserService {
  endpoint = 'accounts/accounts/';
  userDetailSignal = signal<User | null>(null);

  constructor(
    private http: HttpClient,
  ) { }

  getUsers(queryString: string): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`
      ${env.baseUrl}${env.apiV1}${this.endpoint}${queryString}`);
  }

  getUser(id: string): Observable<User> { 
    return this.http.get<User>(`${env.baseUrl}${env.apiV1}${this.endpoint}${id}/`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${env.baseUrl}${env.apiV1}${this.endpoint}`, user);
  }

  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${env.baseUrl}${env.apiV1}${this.endpoint}${id}/`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${env.baseUrl}${env.apiV1}${this.endpoint}${id}/`);
  }
  
  activateDeactivateUser(id: string): Observable<any> {
    return this.http.post(`${env.baseUrl}${env.apiV1}${this.endpoint}${id}/activatedeactivate/`, {});
  }

  changePassword(userChangePassword: UserChangePassword): Observable<any> {
    return this.http.post(`${env.baseUrl}${env.apiV1}${this.endpoint}changepassword/`, userChangePassword);
  }

  passwordReset(passwordReset: PasswordReset): Observable<any> {
    return this.http.post<any>(`${env.baseUrl}${env.apiV1}accounts/publicaccounts/passwordreset/`, passwordReset);
  }

  passwordResetConfirm(passwordResetConfirm: PasswordResetConfirm): Observable<any> {
    return this.http.post<any>(`${env.baseUrl}${env.apiV1}accounts/publicaccounts/passwordresetconfirm/`, passwordResetConfirm);
  }

  getUserDetail(): Observable<any> {
      return this.http.get<any>(`${env.baseUrl}${env.apiV1}${this.endpoint}userdetail/`);
  }

  initGetUserDetail(retries: number = 5, delayMs: number = 3000) {
    let attempts = 0;

    const tryFetch = () => {
      this.getUserDetail().subscribe({
          next: (userDetail: any) => {
            if (userDetail) {
              console.log('Fetched User detail: ', userDetail);
              // // Get the current value from userDetailSignal
              // const currentUserDetail = this.userDetailSignal();
              
              // // Check if the new value is different from the current value
              // if (JSON.stringify(currentUserDetail) !== JSON.stringify(userDetail) || 
              //     currentUserDetail === null) {
              //   console.log('User detail has changed, updating...');
                this.userDetailSignal.set(null); // Clear the current value
                this.userDetailSignal.set(userDetail); // Set the new value
              // } else {
              //   console.log('User detail is the same, no update needed.');
              // }
            } else if (attempts < retries) {
              attempts++;
              console.log('Retrying to get user detail', attempts);
              this.userDetailSignal.set(null);
              setTimeout(tryFetch, delayMs);
            }
        }, 
        error: (error) => {
          this.userDetailSignal.set(null);
          console.log('Error getting user detail');
          console.error(error);
        }
      });
    };
    
    tryFetch();
  }
}
