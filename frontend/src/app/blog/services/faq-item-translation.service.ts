import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { FaqItemTranslation } from '../models/faq-item-translation.model';


@Injectable({
  providedIn: 'root'
})
export class FaqItemTranslationService {
  // e.g. /api/v1/blogs/faqitemtranslations/
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/faqitemtranslations/`;

  constructor(private http: HttpClient) {}

  /** 🔍 List translations (optionally filter by item or language) */
  getAll(filter?: { item?: number; language?: string }): Observable<FaqItemTranslation[]> {
    let params = new HttpParams();
    if (filter?.item != null) params = params.set('item', filter.item);
    if (filter?.language) params = params.set('language', filter.language);
    return this.http.get<FaqItemTranslation[]>(this.endpoint, { params });
  }

  /** 🔍 Get one translation by ID */
  getById(id: number): Observable<FaqItemTranslation> {
    return this.http.get<FaqItemTranslation>(`${this.endpoint}${id}/`);
  }

  /** ➕ Create (JSON body) */
  create(payload: Partial<FaqItemTranslation>): Observable<FaqItemTranslation> {
    return this.http.post<FaqItemTranslation>(this.endpoint, payload);
  }

  /** ✏️ Update (PUT, JSON body) */
  update(id: number, payload: Partial<FaqItemTranslation>): Observable<FaqItemTranslation> {
    return this.http.put<FaqItemTranslation>(`${this.endpoint}${id}/`, payload);
  }

  /** ❌ Delete */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  /** 🧰 Helpers */
  getForItem(itemId: number): Observable<FaqItemTranslation[]> {
    return this.getAll({ item: itemId });
  }

  getForItemAndLang(itemId: number, language: string): Observable<FaqItemTranslation | null> {
    const params = new HttpParams().set('item', itemId).set('language', language);
    return this.http.get<FaqItemTranslation[]>(this.endpoint, { params })
      .pipe(map(list => list[0] ?? null));
  }
}
