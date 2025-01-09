import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { Role } from '../models/role.model';


@Injectable({
  providedIn: 'root'
})
export class RoleService {
  endpoint = 'accounts/roles/';

  constructor(
    private http: HttpClient,
  ) { }

  getRoles(queryString: string): Observable<PaginatedResponse<Role>> {
    return this.http.get<PaginatedResponse<Role>>(
      `${env.baseUrl}${env.apiV1}${this.endpoint}${queryString}`);
  }

  getRole(id: string): Observable<Role> { 
    return this.http.get<Role>(`${env.baseUrl}${env.apiV1}${this.endpoint}${id}/`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${env.baseUrl}${env.apiV1}${this.endpoint}`, role);
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${env.baseUrl}${env.apiV1}${this.endpoint}${id}/`, role);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${env.baseUrl}${env.apiV1}${this.endpoint}${id}/`);
  }

  hasRole(roleNameToCheck: string): boolean {
    const roleNameStored = localStorage.getItem('roleName');
    const isSuperuser = localStorage.getItem('isSuperuser');
    if(isSuperuser === 'true') {
      return true;
    } 
    // role hierarchy

    // 'company_admin',
    // 'company_yonetici',
    // 'company_employee',
    // 'company_rezervasyoncu',
    // 'company_operasyoncu',
    // 'company_driver',

    if(roleNameToCheck === 'company_admin' || roleNameToCheck === 'company_yonetici'){
      if (
        roleNameStored === 'company_admin' || 
        roleNameStored === 'company_yonetici') {
        return true;
      }
    } 
    
    if(roleNameToCheck === 'company_rezervasyoncu'){
      if (
        roleNameStored === 'company_rezervasyoncu' || 
        roleNameStored === 'company_admin' || 
        roleNameStored === 'company_yonetici') {
        return true;
      }
    }
    
    if(roleNameToCheck === 'company_operasyoncu'){
      if (
        roleNameStored === 'company_operasyoncu' || 
        roleNameStored === 'company_rezervasyoncu' || 
        roleNameStored === 'company_admin' || 
        roleNameStored === 'company_yonetici') {
        return true;
      }
    }

    if (roleNameToCheck === 'company_employee') {
      if (
        roleNameStored === 'company_employee' || 
        roleNameStored === 'company_rezervasyoncu' || 
        roleNameStored === 'company_operasyoncu' ||  
        roleNameStored === 'company_admin' || 
        roleNameStored === 'company_yonetici') {
        return true;
      }
    }

    if(roleNameToCheck === 'company_driver'){
      if (
        roleNameStored === 'company_driver' || 
        roleNameStored === 'company_employee' ||
        roleNameStored === 'company_rezervasyoncu' || 
        roleNameStored === 'company_operasyoncu' ||  
        roleNameStored === 'company_admin' || 
        roleNameStored === 'company_yonetici') {
        return true;
      }
    }

    return false;
  }

}
