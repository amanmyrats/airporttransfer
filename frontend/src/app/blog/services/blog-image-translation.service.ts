import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { BlogImageTranslation } from '../models/blog-image-translation.model';

@Injectable({
  providedIn: 'root'
})
export class BlogImageTranslationService  {
  // e.g. /api/v1/blogs/blogimage-translations/
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/blogimagetranslations/`;

  constructor(private http: HttpClient) {}

  // 🔍 List translations (optionally filter by image or language)
  getAll(filter?: { image?: number; language?: string }): Observable<BlogImageTranslation[]> {
    let params = new HttpParams();
    if (filter?.image != null) params = params.set('image', filter.image);
    if (filter?.language) params = params.set('language', filter.language);
    return this.http.get<BlogImageTranslation[]>(this.endpoint, { params });
  }

  // 🔍 Get one translation by ID
  getById(id: number): Observable<BlogImageTranslation> {
    return this.http.get<BlogImageTranslation>(`${this.endpoint}${id}/`);
  }

  // ➕ Create (JSON body)
  create(payload: Partial<BlogImageTranslation>): Observable<BlogImageTranslation> {
    return this.http.post<BlogImageTranslation>(this.endpoint, payload);
  }

  // ✏️ Update (PUT, JSON body)
  update(id: number, payload: Partial<BlogImageTranslation>): Observable<BlogImageTranslation> {
    return this.http.put<BlogImageTranslation>(`${this.endpoint}${id}/`, payload);
  }

  // ❌ Delete
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  // 🧰 Helpers
  getForImage(imageId: number): Observable<BlogImageTranslation[]> {
    return this.getAll({ image: imageId });
  }

  getForImageAndLang(imageId: number, language: string): Observable<BlogImageTranslation | null> {
    const params = new HttpParams().set('image', imageId).set('language', language);
    return this.http.get<BlogImageTranslation[]>(this.endpoint, { params })
      .pipe(map(list => list[0] ?? null));
  }
}
