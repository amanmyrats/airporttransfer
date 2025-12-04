import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { BlogTagTranslation } from '../models/blog-tag-translation.model';

@Injectable({ providedIn: 'root' })
export class BlogTagTranslationService {
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/blogtagtranslations/`;

  constructor(private http: HttpClient) {}

  getAll(filter?: { tag?: number; language?: string }): Observable<BlogTagTranslation[]> {
    let params = new HttpParams();
    if (filter?.tag != null) params = params.set('tag', filter.tag);
    if (filter?.language) params = params.set('language', filter.language);
    return this.http.get<BlogTagTranslation[]>(this.endpoint, { params });
  }

  getById(id: number): Observable<BlogTagTranslation> {
    return this.http.get<BlogTagTranslation>(`${this.endpoint}${id}/`);
  }

  create(payload: Partial<BlogTagTranslation>): Observable<BlogTagTranslation> {
    return this.http.post<BlogTagTranslation>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<BlogTagTranslation>): Observable<BlogTagTranslation> {
    return this.http.put<BlogTagTranslation>(`${this.endpoint}${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  getForTag(tagId: number): Observable<BlogTagTranslation[]> {
    return this.getAll({ tag: tagId });
  }

  getForTagAndLang(tagId: number, language: string): Observable<BlogTagTranslation | null> {
    const params = new HttpParams().set('tag', tagId).set('language', language);
    return this.http.get<BlogTagTranslation[]>(this.endpoint, { params }).pipe(
      map(list => list[0] ?? null)
    );
  }
}
