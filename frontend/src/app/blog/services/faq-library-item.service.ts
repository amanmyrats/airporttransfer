import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { FaqLibraryItem } from '../models/faq-library-item.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class FaqLibraryItemService {
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/faqlibraryitems/`;

  constructor(private http: HttpClient) {}

  /** 🔍 List items */
  getAll(filter?: {
    key?: string;
    is_featured?: boolean;
    is_expanded_by_default?: boolean;
    ordering?: string; // e.g. 'order' | '-updated_at'
    search?: string;
  }): Observable<PaginatedResponse<FaqLibraryItem>> {
    let params = new HttpParams();
    if (filter?.key) params = params.set('key', filter.key);
    if (filter?.is_featured != null) params = params.set('is_featured', String(filter.is_featured));
    if (filter?.is_expanded_by_default != null) params = params.set('is_expanded_by_default', String(filter.is_expanded_by_default));
    if (filter?.ordering) params = params.set('ordering', filter.ordering);
    if (filter?.search) params = params.set('search', filter.search);
    return this.http.get<PaginatedResponse<FaqLibraryItem>>(this.endpoint, { params });
  }

  /** 🔍 Get one */
  getById(id: number): Observable<FaqLibraryItem> {
    return this.http.get<FaqLibraryItem>(`${this.endpoint}${id}/`);
  }

  /** ➕ Create */
  create(payload: Partial<FaqLibraryItem>): Observable<FaqLibraryItem> {
    return this.http.post<FaqLibraryItem>(this.endpoint, payload);
  }

  /** ✏️ Update */
  update(id: number, payload: Partial<FaqLibraryItem>): Observable<FaqLibraryItem> {
    return this.http.put<FaqLibraryItem>(`${this.endpoint}${id}/`, payload);
  }

  /** ❌ Delete */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  /**
   * 🔀 Bulk reorder library items (global)
   * Expects backend action POST /faqlibraryitems/bulk_reorder/
   */
  bulkReorder(rows: Partial<FaqLibraryItem[]>): Observable<FaqLibraryItem[]> {
    return this.http.post<FaqLibraryItem[]>(`${this.endpoint}bulk_reorder/`, { items: rows });
  }

  /**
   * 📌 Move a single library item to new order (server-side)
   * POST /faqlibraryitems/:id/move/ { order }
   */
  move(id: number, newOrder: number): Observable<FaqLibraryItem> {
    return this.http.post<FaqLibraryItem>(`${this.endpoint}${id}/move/`, { order: newOrder });
  }

  /**
   * 💡 Optional helper: move client-side using bulkReorder (if you prefer)
   */
  moveClientSide(id: number, newOrder: number): Observable<FaqLibraryItem[]> {
    return this.getAll({ ordering: 'order' }).pipe(
      map(list => {
        const i = list.results!.findIndex(x => Number(x.id) === id);
        if (i < 0) return list.results!.map((x, idx) => ({ id: x.id!, order: idx }));
        const item = list.results!.splice(i, 1)[0];
        const clamped = Math.max(0, Math.min(newOrder, list.results!.length));
        list.results!.splice(clamped, 0, item);
        return list.results!.map((x, idx) => ({ id: String(x.id!), order: idx.toString() }));
      }),
      switchMap(rows => this.bulkReorder(rows as unknown as any))
    );
  }
}
