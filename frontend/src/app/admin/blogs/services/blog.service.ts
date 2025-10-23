import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { BlogPost } from '../models/blog-post.model';
import { LocalizedBlogPost } from '../models/localized-blog-post.model';
import { PaginatedResponse } from '../../../models/paginated-response.model';


@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private endPoint = 'blogs/blogposts/';

  constructor(private http: HttpClient) {}

  // 🟢 Standard CRUD
  getAll(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${env.baseUrl}${env.apiV1}${this.endPoint}`);
  }

  getById(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  create(post: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, post);
  }

  update(id: number, post: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, post);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  // 🌍 Multilingual localized blog list
  getLocalizedList(queryString: string=''): Observable<PaginatedResponse<LocalizedBlogPost>> {
    return this.http.get<PaginatedResponse<LocalizedBlogPost>>(`${env.baseUrl}${env.apiV1}${this.endPoint}localized/${queryString}`);
  }

  // 🌍 Localized blog by ID
  getLocalizedDetail(id: number, lang: string): Observable<LocalizedBlogPost> {
    return this.http.get<LocalizedBlogPost>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/localized/`, {
      params: { lang }
    });
  }

  // 📈 Increment views
  incrementViews(id: number): Observable<any> {
    return this.http.get<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/increment-view/`, {});
  }

  // 🔍 SEO metadata
  getSeoMetadata(id: number, lang: string): Observable<any> {
    return this.http.get<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/seo/`, {
      params: { lang }
    });
  }

  /** ----------------- Public (slug-based) ----------------- */
  // Detail by slug with lang + optional fallback
  getBySlug(slug: string, lang = 'en', fallback = 'en'): Observable<LocalizedBlogPost> {
    return this.http.get<LocalizedBlogPost>(
      `${env.baseUrl}${env.apiV1}${this.endPoint}by-translation-slug/${encodeURIComponent(slug)}/`,
      { params: { lang, fallback } }
    );
  }
}
