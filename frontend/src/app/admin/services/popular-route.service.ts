import { Injectable, signal } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { PopularRoute } from '../models/popular-route.model';
// import { saveAs } from 'file-saver-es';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class PopularRouteService {
  endPoint: string = "common/popularroutes/";
  isLoadingPricesSignal = signal<boolean>(true);

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
        this.isLoadingPricesSignal.set(false);
      }, 
      error: (err: any) => {
        console.log('Error while fething popuplar places');
        console.log(err);
      }
    });
  }

  getPopularRoutesByMainLocationCodeAndCarType(
    mainLocationCode: string, carTypeCode: string, limitBy: number = 100): PopularRoute[] {
    return this.popularRoutesSignal().filter(
      (popularRoute: PopularRoute) => {
        const matchesLocation =
          popularRoute.main_location === mainLocationCode ||
          popularRoute.airport === mainLocationCode ||
          popularRoute.airport_detail?.code === mainLocationCode ||
          popularRoute.airport_detail?.iata_code === mainLocationCode;
        return matchesLocation && popularRoute.car_type === carTypeCode;
      }).slice(0, limitBy);
  }

  export(queryString: string, format?: string): Observable<any> {
    const options = {
      responseType: 'blob' as 'json',
      observe: 'response' as 'body',
    };

    return this.http.get(`${env.baseUrl}${env.apiV1}${this.endPoint}export/${queryString}`, options);
  }

  handleExport(queryString: string): void {
    this.export(queryString).subscribe({
      next: (response: any) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        console.log("contentDisposition:");
        console.log(contentDisposition);
        const fileName = this.getFileNameFromHeader(contentDisposition);
        const blob = new Blob([response.body], { type: response.body.type });

        saveAs(blob, fileName);
      },
      error: (error: any) => {
        console.error('Export error:', error);
      }
    }
    )
  }

  getFileNameFromHeader(contentDisposition: string): string {
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="(.+?)"/);
      console.log("matches:");
      console.log(matches);
      console.log("matches && matches[1]");
      console.log(matches && matches[1]);
      return matches && matches[1] ? matches[1] : 'popular_routes.csv'; // Default file name
    }
    return 'popular_routes.csv'; // Fallback name
  }

  private getFileExtension(format: string): string {
    switch (format.toLowerCase()) {
      case 'csv':
        return 'csv';
      case 'json':
        return 'json';
      case 'xlsx':
        return 'xlsx';
      default:
        return 'txt';
    }
  }

  import(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${env.baseUrl}${env.apiV1}${this.endPoint}import_data/`, formData);
  }

}
