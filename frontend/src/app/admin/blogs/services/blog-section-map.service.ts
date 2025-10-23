// blog-section-map.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { BlogSectionMap } from '../models/blog-section-map.model';

@Injectable({ providedIn: 'root' })
export class BlogSectionMapService {
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/section-maps/`;

  constructor(private http: HttpClient) {}

  getAll(filter?: {
    section?: string | number;
    is_active?: boolean | string;
    provider?: string;
    internal_identifier?: string;
  }): Observable<BlogSectionMap[]> {
    let params = new HttpParams();
    if (filter?.section != null) params = params.set('section', String(filter.section));
    if (filter?.is_active != null) params = params.set('is_active', String(filter.is_active));
    if (filter?.provider) params = params.set('provider', filter.provider);
    if (filter?.internal_identifier) params = params.set('internal_identifier', filter.internal_identifier);
    return this.http.get<BlogSectionMap[]>(this.endpoint, { params });
  }

  getBySection(sectionId: string | number): Observable<BlogSectionMap> {
    // since OneToOne uses section as PK, detail route is /section-maps/<sectionId>/
    return this.http.get<BlogSectionMap>(`${this.endpoint}${sectionId}/`);
  }

  /** Language-resolved payload (uses viewset action /for-section/<id>/?lang=xx) */
  getForSection(sectionId: string | number, lang: string): Observable<BlogSectionMap> {
    const url = `${this.endpoint}for-section/${sectionId}/`;
    const params = new HttpParams().set('lang', lang);
    return this.http.get<BlogSectionMap>(url, { params });
  }

  create(payload: Partial<BlogSectionMap>): Observable<BlogSectionMap> {
    return this.http.post<BlogSectionMap>(this.endpoint, payload);
  }

  /** Minimal create—only section id (other fields default) */
  createEmpty(sectionId: string | number): Observable<BlogSectionMap> {
    return this.http.post<BlogSectionMap>(this.endpoint, { section: String(sectionId) });
  }

  update(sectionId: string | number, payload: Partial<BlogSectionMap>): Observable<BlogSectionMap> {
    return this.http.put<BlogSectionMap>(`${this.endpoint}${sectionId}/`, payload);
  }

  delete(sectionId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${sectionId}/`);
  }
}
