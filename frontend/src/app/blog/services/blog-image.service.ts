import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BlogImage } from '../models/blog-image.model';
import { Observable } from 'rxjs';
import { environment as env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogImageService {
  private readonly endpoint = `${env.baseUrl}${env.apiV1}blogs/blogimages/`;

  constructor(private http: HttpClient) {}

  // 🔍 Get all blog images
  getAll(): Observable<BlogImage[]> {
    return this.http.get<BlogImage[]>(this.endpoint);
  }

  // 🔍 Get one image by ID
  getById(id: number): Observable<BlogImage> {
    return this.http.get<BlogImage>(`${this.endpoint}${id}/`);
  }

  // ➕ Create new image using FormData
  create(blogImage: BlogImage): Observable<BlogImage> {
    return this.http.post<BlogImage>(this.endpoint, blogImage);
  }
  
  createEmpty(sectionId: number) {
    const fd = new FormData();
    fd.append('section', String(sectionId));
    return this.http.post<BlogImage>(this.endpoint, fd);
  }
  // // create BlogImage with only image (multipart form data)
  // createWithImage(formData: FormData): Observable<BlogImage> {
  //   return this.http.post<BlogImage>(`${this.endpoint}createwithimage/`, formData);
  // }

  // ✏️ Update existing image (PUT) using FormData
  update(id: number, formData: FormData): Observable<BlogImage> {
    return this.http.put<BlogImage>(`${this.endpoint}${id}/`, formData);
  }

  // ❌ Delete image
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.endpoint}${id}/`);
  }

  getResolvedTranslation(id: number, lang: string): Observable<any> {
    return this.http.get<any>(`${this.endpoint}${id}/resolved_translation/`, 
      { params: { lang: lang }}
    )
  }


  uploadImage(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post<any>(`${this.endpoint}${id}/upload-image/`, formData);
  }

  deleteImage(id: number): Observable<any> {
    return this.http.delete<any>(`${this.endpoint}${id}/remove-image/`);
  }

  changeImageName(id: number, newName: string): Observable<any> {
    return this.http.post<any>(`${this.endpoint}${id}/change-image-name/`, { new_name: newName });
  }
}
