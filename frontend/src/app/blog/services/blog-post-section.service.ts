import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogSection } from '../models/blog-section.model';
import { environment as env } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class BlogPostSectionService {
  private endPoint = 'blogs/blogsections/';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PaginatedResponse<BlogSection>> {
    return this.http.get<PaginatedResponse<BlogSection>>(`${env.baseUrl}${env.apiV1}${this.endPoint}`);
  }

  getAllByPostId(postId: number): Observable<PaginatedResponse<BlogSection>> {
    return this.http.get<PaginatedResponse<BlogSection>>(`${env.baseUrl}${env.apiV1}${this.endPoint}?post=${postId}`);
  }

  getById(id: number): Observable<BlogSection> {
    return this.http.get<BlogSection>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  create(data: Partial<BlogSection>): Observable<BlogSection> {
    return this.http.post<BlogSection>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, data);
  }

  update(id: number, data: Partial<BlogSection>): Observable<BlogSection> {
    return this.http.put<BlogSection>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  reorder(sections: { id: number, order: number }[]) {
    return this.http.post(`${env.baseUrl}${env.apiV1}${this.endPoint}reorder/`, sections);
  }

  getSectionTypes() {
    return this.http.get<Array<{ label: string; value: string }>>(
      `${env.baseUrl}${env.apiV1}${this.endPoint}types/`
    );
  }
  
}
