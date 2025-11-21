import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { BlogCategoryTranslation } from '../models/blog-category-translation.model';

@Injectable({ providedIn: 'root' })
export class BlogCategoryTranslationService {
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/blogcategorytranslations/`;

  constructor(private http: HttpClient) {}

  getAll(filter?: { category?: number; language?: string }): Observable<BlogCategoryTranslation[]> {
    let params = new HttpParams();
    if (filter?.category != null) params = params.set('category', filter.category);
    if (filter?.language) params = params.set('language', filter.language);
    return this.http.get<BlogCategoryTranslation[]>(this.endpoint, { params });
  }

  getById(id: number): Observable<BlogCategoryTranslation> {
    return this.http.get<BlogCategoryTranslation>(`${this.endpoint}${id}/`);
  }

  create(payload: Partial<BlogCategoryTranslation>): Observable<BlogCategoryTranslation> {
    return this.http.post<BlogCategoryTranslation>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<BlogCategoryTranslation>): Observable<BlogCategoryTranslation> {
    return this.http.put<BlogCategoryTranslation>(`${this.endpoint}${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  getForCategory(categoryId: number): Observable<BlogCategoryTranslation[]> {
    return this.getAll({ category: categoryId });
  }

  getForCategoryAndLang(categoryId: number, language: string): Observable<BlogCategoryTranslation | null> {
    const params = new HttpParams().set('category', categoryId).set('language', language);
    return this.http.get<BlogCategoryTranslation[]>(this.endpoint, { params }).pipe(
      map(list => list[0] ?? null)
    );
  }
}
