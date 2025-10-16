// blog-section-map-translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, of } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { BlogSectionMapTranslation } from '../models/blog-section-map-translation.model';

@Injectable({ providedIn: 'root' })
export class BlogSectionMapTranslationService {
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/section-map-translations/`;

  constructor(private http: HttpClient) {}

  getAll(filter?: { section_map?: string | number; language?: string }): Observable<BlogSectionMapTranslation[]> {
    let params = new HttpParams();
    if (filter?.section_map != null) params = params.set('section_map', String(filter.section_map));
    if (filter?.language) params = params.set('language', filter.language);
    return this.http.get<BlogSectionMapTranslation[]>(this.endpoint, { params });
  }

  getById(id: string | number): Observable<BlogSectionMapTranslation> {
    return this.http.get<BlogSectionMapTranslation>(`${this.endpoint}${id}/`);
  }

  create(payload: Partial<BlogSectionMapTranslation>): Observable<BlogSectionMapTranslation> {
    return this.http.post<BlogSectionMapTranslation>(this.endpoint, payload);
  }

  update(id: string | number, payload: Partial<BlogSectionMapTranslation>): Observable<BlogSectionMapTranslation> {
    return this.http.put<BlogSectionMapTranslation>(`${this.endpoint}${id}/`, payload);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  /** Helper: list translations for a specific section map */
  getForSectionMap(sectionMapId: string | number): Observable<BlogSectionMapTranslation[]> {
    return this.getAll({ section_map: sectionMapId });
  }

  /** Helper: get a single translation for (sectionMap, language) */
  getForSectionMapAndLang(sectionMapId: string | number, language: string)
    : Observable<BlogSectionMapTranslation | null> {
    const params = new HttpParams()
      .set('section_map', String(sectionMapId))
      .set('language', language);
    return this.http
      .get<BlogSectionMapTranslation[]>(this.endpoint, { params })
      .pipe(map(list => list[0] ?? null));
  }

  /**
   * Upsert: set or update embed_url for (sectionMap, language).
   * If translation exists -> update; else create.
   */
  setEmbedUrl(sectionMapId: string | number, language: string, embedUrl: string)
    : Observable<BlogSectionMapTranslation> {
    return this.getForSectionMapAndLang(sectionMapId, language).pipe(
      switchMap(existing => {
        if (existing?.id) {
          return this.update(existing.id, { embed_url: embedUrl });
        }
        return this.create({ section_map: String(sectionMapId), language, embed_url: embedUrl });
      })
    );
  }
}
