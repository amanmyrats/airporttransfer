import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogPost } from '../models/blog-post.model';
import { environment as env } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class BlogPostService {
  private endPoint = 'blogs/blogposts/';

  constructor(private http: HttpClient) {}

  // 🟢 Get all blog posts
  getAll(queryString: string=''): Observable<PaginatedResponse<BlogPost>> {
    return this.http.get<PaginatedResponse<BlogPost>>(`${env.baseUrl}${env.apiV1}${this.endPoint}${queryString}`);
  }

  // 🟢 Get a blog post by ID
  getById(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  // 🟢 Create a blog post
  create(post: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, post);
  }

  // 🟢 Update a blog post
  update(id: number, post: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, post);
  }

  // 🟢 Delete a blog post
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  // 🌍 Get localized blog list
  getLocalizedList(lang: string): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${env.baseUrl}${env.apiV1}${this.endPoint}localized/`, {
      params: { lang }
    });
  }

  // 🌍 Get single localized blog post
  getLocalizedDetail(id: number, lang: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/localized/`, {
      params: { lang }
    });
  }

  // 📈 Increment view count
  incrementViews(id: number): Observable<any> {
    return this.http.post<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/increment-view/`, {});
  }

  // 🔍 Get SEO metadata
  getSeoMetadata(id: number, lang: string): Observable<any> {
    return this.http.get<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/seo/`, {
      params: { lang }
    });
  }

  uploadMainImage(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('main_image', file, file.name);
    return this.http.post<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/upload-main-image/`, formData);
  }

  deleteMainImage(id: number): Observable<any> {
    return this.http.delete<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/remove-main-image/`);
  }

  getRelatedPosts(id: number, lang: string, limit: number = 4): Observable<any[]> {
    return this.http.get<any[]>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/related/`, {
      params: { lang, limit: limit.toString() }
    });
  }
}
