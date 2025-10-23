import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogSectionTranslation } from '../models/blog-section-translation.model';
import { environment as env } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BlogPostSectionTranslationService {
  private endPoint = 'blogs/blogsectiontranslations/';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BlogSectionTranslation[]> {
    return this.http.get<BlogSectionTranslation[]>(`${env.baseUrl}${env.apiV1}${this.endPoint}`);
  }

  getById(id: number): Observable<BlogSectionTranslation> {
    return this.http.get<BlogSectionTranslation>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  create(data: Partial<BlogSectionTranslation>): Observable<BlogSectionTranslation> {
    return this.http.post<BlogSectionTranslation>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, data);
  }

  update(id: number, data: Partial<BlogSectionTranslation>): Observable<BlogSectionTranslation> {
    return this.http.put<BlogSectionTranslation>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }
}
