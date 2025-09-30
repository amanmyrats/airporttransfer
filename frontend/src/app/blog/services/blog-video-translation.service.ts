// blog-video-translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { BlogVideoTranslation } from '../models/blog-video-translation.model';

@Injectable({ providedIn: 'root' })
export class BlogVideoTranslationService {
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/blogvideotranslations/`;

  constructor(private http: HttpClient) {}

  getAll(filter?: { video?: string; language?: string }): Observable<BlogVideoTranslation[]> {
    let params = new HttpParams();
    if (filter?.video != null) params = params.set('video', filter.video);
    if (filter?.language) params = params.set('language', filter.language);
    return this.http.get<BlogVideoTranslation[]>(this.endpoint, { params });
  }

  getById(id: string): Observable<BlogVideoTranslation> {
    return this.http.get<BlogVideoTranslation>(`${this.endpoint}${id}/`);
  }

  create(payload: Partial<BlogVideoTranslation>): Observable<BlogVideoTranslation> {
    return this.http.post<BlogVideoTranslation>(this.endpoint, payload);
  }

  update(id: string, payload: Partial<BlogVideoTranslation>): Observable<BlogVideoTranslation> {
    return this.http.put<BlogVideoTranslation>(`${this.endpoint}${id}/`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}${id}/`);
  }

  getForVideo(videoId: string): Observable<BlogVideoTranslation[]> {
    return this.getAll({ video: videoId });
  }

  getForVideoAndLang(videoId: string, language: string): Observable<BlogVideoTranslation | null> {
    const params = new HttpParams().set('video', videoId).set('language', language);
    return this.http.get<BlogVideoTranslation[]>(this.endpoint, { params })
      .pipe(map(list => list[0] ?? null));
  }
}
