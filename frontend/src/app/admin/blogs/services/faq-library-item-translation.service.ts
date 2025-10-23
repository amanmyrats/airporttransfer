import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
// Optionally replace `any` with your real model interface
import { FaqLibraryItemTranslation } from '../models/faq-library-item-translation.model';

@Injectable({ providedIn: 'root' })
export class FaqLibraryItemTranslationService {
  // /api/v1/blogs/faqlibraryitemtranslations/
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/faqlibraryitemtranslations/`;

  constructor(private http: HttpClient) {}

  /** 🔍 List translations */
  getAll(filter?: { item?: number; language?: string }): Observable<FaqLibraryItemTranslation[]> {
    let params = new HttpParams();
    if (filter?.item != null) params = params.set('item', filter.item);
    if (filter?.language) params = params.set('language', filter.language);
    return this.http.get<FaqLibraryItemTranslation[]>(this.endpoint, { params });
  }

  /** 🔍 Get one */
  getById(id: number): Observable<FaqLibraryItemTranslation> {
    return this.http.get<FaqLibraryItemTranslation>(`${this.endpoint}${id}/`);
  }

  /** ➕ Create */
  create(payload: Partial<FaqLibraryItemTranslation>): Observable<FaqLibraryItemTranslation> {
    return this.http.post<FaqLibraryItemTranslation>(this.endpoint, payload);
  }

  /** ✏️ Update */
  update(id: number, payload: Partial<FaqLibraryItemTranslation>): Observable<FaqLibraryItemTranslation> {
    return this.http.put<FaqLibraryItemTranslation>(`${this.endpoint}${id}/`, payload);
  }

  /** ❌ Delete */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  /** 🧰 Helpers */
  getForItem(itemId: number): Observable<FaqLibraryItemTranslation[]> {
    return this.getAll({ item: itemId });
  }

  getForItemAndLang(itemId: number, language: string): Observable<FaqLibraryItemTranslation | null> {
    const params = new HttpParams().set('item', itemId).set('language', language);
    return this.http.get<FaqLibraryItemTranslation[]>(this.endpoint, { params })
      .pipe(map(list => list[0] ?? null));
  }
}
