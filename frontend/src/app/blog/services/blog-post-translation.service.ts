import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogPostTranslation } from '../models/blog-post-translation.model';
import { environment as env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogPostTranslationService {
  private endPoint = 'blogs/blogposttranslations/';

  constructor(private http: HttpClient) {}

  // 🟢 Get all translations
  getAll(): Observable<BlogPostTranslation[]> {
    return this.http.get<BlogPostTranslation[]>(`${env.baseUrl}${env.apiV1}${this.endPoint}`);
  }

  // 🔍 Get translation by ID
  getById(id: number): Observable<BlogPostTranslation> {
    return this.http.get<BlogPostTranslation>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  // ➕ Create translation
  create(data: Partial<BlogPostTranslation>): Observable<BlogPostTranslation> {
    return this.http.post<BlogPostTranslation>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, data);
  }

  // ✏️ Update translation
  update(id: number, data: Partial<BlogPostTranslation>): Observable<BlogPostTranslation> {
    return this.http.put<BlogPostTranslation>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`, data);
  }

  // 🗑️ Delete translation
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}${id}/`);
  }

  // 📄 Get all translations of a specific blog post
  getByPostId(postId: number): Observable<BlogPostTranslation[]> {
    return this.http.get<BlogPostTranslation[]>(`${env.baseUrl}${env.apiV1}blogs/blogposts/${postId}/translations/`);
    // Make sure this view exists on the backend or implement it if necessary
  }
}
