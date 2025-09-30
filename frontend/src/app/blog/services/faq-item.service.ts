import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { FaqItem } from '../models/faq-item.model';


@Injectable({
  providedIn: 'root'
})
export class FaqItemService {
  // e.g. /api/v1/blogs/faqitems/
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/faqitems/`;

  constructor(private http: HttpClient) {}

  /** 🔍 List items (optionally filter by section, featured, language for server-side filtering) */
  getAll(filter?: {
    section?: number;
    is_featured?: boolean;
    language?: string;    // if your DRF view supports lang filtering
    ordering?: string;    // e.g. 'order' or '-order'
    search?: string;      // if you add search in DRF
  }): Observable<FaqItem[]> {
    let params = new HttpParams();
    if (filter?.section != null) params = params.set('section', filter.section);
    if (filter?.is_featured != null) params = params.set('is_featured', String(filter.is_featured));
    if (filter?.language) params = params.set('language', filter.language);
    if (filter?.ordering) params = params.set('ordering', filter.ordering);
    if (filter?.search) params = params.set('search', filter.search);
    return this.http.get<FaqItem[]>(this.endpoint, { params });
  }

  /** 🔍 Get one by ID */
  getById(id: number): Observable<FaqItem> {
    return this.http.get<FaqItem>(`${this.endpoint}${id}/`);
  }

  /** ➕ Create (JSON body) */
  create(payload: Partial<FaqItem>): Observable<FaqItem> {
    return this.http.post<FaqItem>(this.endpoint, payload);
  }

  /** ✏️ Update (PUT, JSON body) */
  update(id: number, payload: Partial<FaqItem>): Observable<FaqItem> {
    return this.http.put<FaqItem>(`${this.endpoint}${id}/`, payload);
  }

  /** ❌ Delete */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  /** 🧰 Helpers */
  getForSection(sectionId: number): Observable<FaqItem[]> {
    return this.getAll({ section: sectionId, ordering: 'order' });
  }

  /**
   * 🔀 Optional: bulk reorder helper (expects your DRF ViewSet action e.g. POST /faqitems/bulk_reorder/)
   * Body shape: [{id: number, order: number}, ...]
   * If you don’t have it yet, you can comment this out.
   */
  bulkReorder(sectionId: number, rows: Partial<FaqItem[]>): Observable<any> {
    return this.http.post<any>(`${this.endpoint}bulk_reorder/`, {
      section: sectionId,
      items: rows
    });
  }

  /**
   * 📌 Optional: move one item (expects custom action /:id/move/)
   * If not implemented server-side, remove/comment this method.
   */
  move(id: number, newOrder: number): Observable<FaqItem> {
    return this.http.post<FaqItem>(`${this.endpoint}${id}/move/`, { order: newOrder });
  }
}
