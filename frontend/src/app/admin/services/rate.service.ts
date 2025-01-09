import { Injectable } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { Rate } from '../models/rate.model';

@Injectable({
  providedIn: 'root'
})
export class RateService {
  endPoint: string = "common/rates/";

  constructor(
    private http: HttpClient, 
  ) { }

  getRates(queryString: string): Observable<PaginatedResponse<Rate>> {
    return this.http.get<PaginatedResponse<Rate>>(`${env.baseUrl}${env.apiV1}${this.endPoint}${queryString}`);
  }

  getRate(id: string): Observable<Rate> {
    return this.http.get<Rate>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  createRate(rate: any): Observable<Rate>  {
    return this.http.post<Rate>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, rate);
  }

  updateRate(id: string, rate: any): Observable<Rate>  {
    return this.http.put<Rate>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, rate);
  }

  deleteRate(id: string): Observable<any>  {
    return this.http.delete<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

}
