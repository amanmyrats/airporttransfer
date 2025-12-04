import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogCategory } from '../models/blog-category.model';
import { environment as env } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class BlogCategoryService {
  private endPoint = 'blogs/blogcategories/';

  constructor(private http: HttpClient) {}

  getAll(queryString: string='', lang?: string): Observable<PaginatedResponse<BlogCategory>> {
    let suffix = queryString || '';
    if (lang) {
      suffix += `${suffix ? (suffix.includes('?') ? '&' : '?') : '?'}lang=${lang}`;
    }
    return this.http.get<PaginatedResponse<BlogCategory>>(`${env.baseUrl}${env.apiV1}${this.endPoint}${suffix}`);
  }

  getById(id: number, lang?: string): Observable<BlogCategory> {
    const suffix = lang ? `?lang=${lang}` : '';
    return this.http.get<BlogCategory>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/${suffix}`);
  }

  create(data: Partial<BlogCategory>): Observable<BlogCategory> {
    return this.http.post<BlogCategory>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, data);
  }

  update(id: number, data: Partial<BlogCategory>): Observable<BlogCategory> {
    return this.http.put<BlogCategory>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }
}
