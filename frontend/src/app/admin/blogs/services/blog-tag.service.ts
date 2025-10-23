import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogTag } from '../models/blog-tag.model';
import { environment as env } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class BlogTagService {
  private endPoint = 'blogs/blogtags/'; // You must ensure this endpoint is added to your Django router

  constructor(private http: HttpClient) {}

  getAll(queryString: string=''): Observable<PaginatedResponse<BlogTag>> {
    return this.http.get<PaginatedResponse<BlogTag>>(`${env.baseUrl}${env.apiV1}${this.endPoint}${queryString}`);
  }

  getById(id: number): Observable<BlogTag> {
    return this.http.get<BlogTag>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  create(data: Partial<BlogTag>): Observable<BlogTag> {
    return this.http.post<BlogTag>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, data);
  }

  update(id: number, data: Partial<BlogTag>): Observable<BlogTag> {
    return this.http.put<BlogTag>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }
}
