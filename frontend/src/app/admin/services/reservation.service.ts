import { Injectable } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation.model';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root', 
})
export class ReservationService {
  endPoint: string = "transfer/reservations/"
  constructor(
    private http: HttpClient
  ) { 
  }

  getReservations(queryString: string): Observable<PaginatedResponse<Reservation>> {
    return this.http.get<PaginatedResponse<Reservation>>(
      `${env.baseUrl}${env.apiV1}${this.endPoint}${queryString}`);
  }

  getReservation(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  createReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, reservation);
  }

  updateReservation(id: string, reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, reservation);
  }

  deleteReservation(id: string): Observable<any> {
    return this.http.delete(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  getStatuses(): Observable<any[]> {
    return this.http.get<any[]>(`${env.baseUrl}${env.apiV1}transfer/statuschoices/`);
  }

  updateStatus(id: string, reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/update_status/`, reservation);
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
      return matches && matches[1] ? matches[1] : 'reservasyonlar.csv'; // Default file name
    }
    return 'reservasyonlar.csv'; // Fallback name
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

}
