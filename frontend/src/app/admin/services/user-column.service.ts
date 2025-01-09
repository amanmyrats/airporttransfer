import { Injectable } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { Column } from '../models/column.model';

@Injectable({
  providedIn: 'root'
})
export class UserColumnService {
  endPoint: string = "accounts/usercolumns/"

  constructor(
    private http: HttpClient
  ) { }

  getUserColumns(queryString: string): Observable<PaginatedResponse<Column>> {
    return this.http.get<PaginatedResponse<Column>>(
      `${env.baseUrl}${env.apiV1}${this.endPoint}${queryString}`);
  }

  getUserColumn(id: number): Observable<Column> {
    return this.http.get<Column>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  createUserColumn(userColumn: Column): Observable<Column> {
    return this.http.post<Column>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, userColumn);
  }

  updateUserColumn(id: string, userColumn: Column): Observable<Column> {
    return this.http.put<Column>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, userColumn);
  }

  deleteUserColumn(id: string): Observable<any> {
    return this.http.delete(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  bulkCreateUserColumns(userColumns: Column[]): Observable<Column[]> {
    return this.http.post<Column[]>(`${env.baseUrl}${env.apiV1}${this.endPoint}bulkcreate/`, userColumns);
  }

  bulkUpdateUserColumns(userColumns: Column[]): Observable<Column[]> {
    return this.http.put<Column[]>(`${env.baseUrl}${env.apiV1}${this.endPoint}bulkupdate/`, userColumns);
  }

}
