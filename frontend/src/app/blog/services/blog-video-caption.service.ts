// blog-video-caption.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { BlogVideoTrack } from '../models/blog-video-track.model';

@Injectable({ providedIn: 'root' })
export class BlogVideoCaptionService {
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/blogvideocaptions/`;

  constructor(private http: HttpClient) {}

  getAll(filter?: { video?: string; language?: string; kind?: string; is_default?: boolean }): Observable<BlogVideoTrack[]> {
    let params = new HttpParams();
    if (filter?.video != null) params = params.set('video', filter.video);
    if (filter?.language) params = params.set('language', filter.language);
    if (filter?.kind) params = params.set('kind', filter.kind);
    if (filter?.is_default != null) params = params.set('is_default', String(filter.is_default));
    return this.http.get<BlogVideoTrack[]>(this.endpoint, { params });
  }

  getById(id: string): Observable<BlogVideoTrack> {
    return this.http.get<BlogVideoTrack>(`${this.endpoint}${id}/`);
  }

  create(payload: Partial<BlogVideoTrack>): Observable<BlogVideoTrack> {
    return this.http.post<BlogVideoTrack>(this.endpoint, payload);
  }

  update(id: string, payload: Partial<BlogVideoTrack>): Observable<BlogVideoTrack> {
    return this.http.put<BlogVideoTrack>(`${this.endpoint}${id}/`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }
}
