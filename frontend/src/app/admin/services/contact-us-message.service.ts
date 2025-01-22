import { Injectable } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { ContactUsMessage } from '../models/contact-us-message.model';

@Injectable({
  providedIn: 'root'
})
export class ContactUsMessageService {
  endPoint: string = "transfer/contactusmessages/"
  constructor(
    private http: HttpClient
  ) { }

  getContactUsMessages(queryString: string): Observable<PaginatedResponse<ContactUsMessage>> {
    return this.http.get<PaginatedResponse<ContactUsMessage>>(
      `${env.baseUrl}${env.apiV1}${this.endPoint}${queryString}`);
  }

  getContactUsMessage(id: number): Observable<ContactUsMessage> {
    return this.http.get<ContactUsMessage>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  createContactUsMessage(contactUsMessage: ContactUsMessage): Observable<ContactUsMessage> {
    return this.http.post<ContactUsMessage>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, contactUsMessage);
  }

  updateContactUsMessage(id: string, contactUsMessage: ContactUsMessage): Observable<ContactUsMessage> {
    return this.http.put<ContactUsMessage>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, contactUsMessage);
  }

  deleteContactUsMessage(id: string): Observable<any> {
    return this.http.delete(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  sendMessage(contactUsMessage: ContactUsMessage): Observable<ContactUsMessage> {
    return this.http.post<ContactUsMessage>(`${env.baseUrl}${env.apiV1}transfer/sendmessage/`, contactUsMessage);
  }
}
