import { Injectable, signal } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { PopularRoute } from '../models/popular-route.model';

@Injectable({
  providedIn: 'root'
})
export class PopularRouteService {
  endPoint: string = "common/popularroutes/";

  popularRoutesSignal = signal<PopularRoute[]>([]);

  constructor(
    private http: HttpClient, 
  ) { }

  getPopularRoutes(queryString: string): Observable<PaginatedResponse<PopularRoute>> {
    return this.http.get<PaginatedResponse<PopularRoute>>(`${env.baseUrl}${env.apiV1}${this.endPoint}${queryString}`);
  }

  getPopularRoute(id: string): Observable<PopularRoute> {
    return this.http.get<PopularRoute>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  createPopularRoute(popularRoute: any): Observable<PopularRoute>  {
    return this.http.post<PopularRoute>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, popularRoute);
  }

  updatePopularRoute(id: string, popularRoute: any): Observable<PopularRoute>  {
    return this.http.put<PopularRoute>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, popularRoute);
  }

  deletePopularRoute(id: string): Observable<any>  {
    return this.http.delete<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  updatePopularRoutesSignal(): void {
    this.getPopularRoutes('').subscribe({
      next: (paginatedResponse: PaginatedResponse<PopularRoute>)=> {
        this.popularRoutesSignal.set(paginatedResponse.results!);
        console.log('Fetched popular places and set it to signal')
        console.log(paginatedResponse.results!)
      }, 
      error: (err: any) => {
        console.log('Error while fething popuplar places');
        console.log(err);
      }
    });
  }

  getPopularRoutesByMainLocationCodeAndCarType(mainLocationCode: string, carTypeCode: string): PopularRoute[] {
    return this.popularRoutesSignal().filter(
      (popularRoute: PopularRoute) => popularRoute.main_location === mainLocationCode && popularRoute.car_type === carTypeCode);
  }

}
