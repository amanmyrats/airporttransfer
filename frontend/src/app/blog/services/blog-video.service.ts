// blog-video.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { BlogVideo } from '../models/blog-video.model';

@Injectable({ providedIn: 'root' })
export class BlogVideoService {
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/blogvideos/`;

  constructor(private http: HttpClient) {}

  getAll(filter?: { section?: string; provider?: string }): Observable<BlogVideo[]> {
    let params = new HttpParams();
    if (filter?.section != null) params = params.set('section', filter.section);
    if (filter?.provider) params = params.set('provider', filter.provider);
    return this.http.get<BlogVideo[]>(this.endpoint, { params });
  }

  getById(id: string): Observable<BlogVideo> {
    return this.http.get<BlogVideo>(`${this.endpoint}${id}/`);
  }

  create(payload: Partial<BlogVideo>): Observable<BlogVideo> {
    return this.http.post<BlogVideo>(this.endpoint, payload);
  }

  createEmpty(sectionId: string): Observable<BlogVideo> {
    const fd = new FormData();
    fd.append('section', String(sectionId));
    return this.http.post<BlogVideo>(this.endpoint, fd);
  }

  update(id: string, payload: Partial<BlogVideo>): Observable<BlogVideo> {
    return this.http.put<BlogVideo>(`${this.endpoint}${id}/`, payload);
  }

  updateForm(id: string, formData: FormData): Observable<BlogVideo> {
    return this.http.put<BlogVideo>(`${this.endpoint}${id}/`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  getPublic(id: string, lang: string): Observable<any> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<any>(`${this.endpoint}${id}/public/`, { params });
  }

  uploadPoster(id: string, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('poster', file, file.name);
    return this.http.post<any>(`${this.endpoint}${id}/upload-poster/`, fd);
  }
}
