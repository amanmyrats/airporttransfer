import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { MainLocation } from '../models/main-location.model';

@Injectable({
  providedIn: 'root'
})
export class MainLocationService {
  endPoint: string = "mainlocations/";
  constructor(
    private http: HttpClient
  ) { }

  getMainLocations(queryString: string): Observable<PaginatedResponse<MainLocation>> {
    return this.http.get<PaginatedResponse<MainLocation>>(
      `${env.baseUrl}${env.apiV1}${this.endPoint}${queryString}`);
  }

  getMainLocation(id: string): Observable<MainLocation> {
    return this.http.get<MainLocation>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  createMainLocation(mainLocation: MainLocation): Observable<MainLocation> {
    return this.http.post<MainLocation>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, mainLocation);
  }

  updateMainLocation(id: string, mainLocation: MainLocation): Observable<MainLocation> {
    return this.http.put<MainLocation>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, mainLocation);
  }

  deleteMainLocation(id: string): Observable<any> {
    return this.http.delete(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

}
