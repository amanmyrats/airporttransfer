import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '../../../environments/environment';
// Optionally replace `any` with your real model interface
import { BlogPostFaqLink } from '../models/blog-post-faq-link.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

export interface ResolvedFaq {
  id: number;
  order: number;
  faq_item: number;
  language: string;
  question: string;
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class BlogPostFaqLinkService {
  // /api/v1/blogs/blogpostfaqlinks/
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/blogpostfaqlinks/`;

  constructor(private http: HttpClient) {}

  /** 🔍 List links */
  getAll(filter?: {
    blog_post?: number;
    faq_item?: number;
    ordering?: string; // 'order' | '-order'
    search?: string;
  }): Observable<PaginatedResponse<BlogPostFaqLink> > {
    let params = new HttpParams();
    if (filter?.blog_post != null) params = params.set('blog_post', filter.blog_post);
    if (filter?.faq_item != null) params = params.set('faq_item', filter.faq_item);
    if (filter?.ordering) params = params.set('ordering', filter.ordering);
    if (filter?.search) params = params.set('search', filter.search);
    return this.http.get<PaginatedResponse<BlogPostFaqLink>>(this.endpoint, { params });
  }

  /** 🔍 Get one */
  getById(id: number): Observable<BlogPostFaqLink> {
    return this.http.get<BlogPostFaqLink>(`${this.endpoint}${id}/`);
  }

  /** ➕ Create */
  create(payload: Partial<BlogPostFaqLink>): Observable<BlogPostFaqLink> {
    return this.http.post<BlogPostFaqLink>(this.endpoint, payload);
  }

  /** ✏️ Update */
  update(id: number, payload: Partial<BlogPostFaqLink>): Observable<BlogPostFaqLink> {
    return this.http.put<BlogPostFaqLink>(`${this.endpoint}${id}/`, payload);
  }

  /** ❌ Delete */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  /** 🔀 Bulk reorder (POST /blogpostfaqlinks/bulk_reorder/) */
  bulkReorder(blogPostId: number, rows: Array<{ id: number; order: number }>): Observable<BlogPostFaqLink[]> {
    return this.http.post<BlogPostFaqLink[]>(`${this.endpoint}bulk_reorder/`, {
      blog_post: blogPostId,
      items: rows
    });
  }

  /** 🧩 Resolved Q/A (GET /blogpostfaqlinks/resolved/?blog_post=&language=) */
  getResolved(blogPostId: number, language: string): Observable<ResolvedFaq[]> {
    const params = new HttpParams().set('blog_post', blogPostId).set('language', language);
    return this.http.get<ResolvedFaq[]>(`${this.endpoint}resolved/`, { params });
  }
}
