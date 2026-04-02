import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PaginatedVideos,
  Video,
  VideoCategory,
} from '../../videos/models/video.model';

@Injectable({
  providedIn: 'root',
})
export class AdminVideoService {
  private readonly baseUrl = `${environment.baseUrl}/admin`;
  private readonly baseUrl2 = `${environment.baseUrl}/videos`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<VideoCategory[]> {
    return this.http.get<VideoCategory[]>(`${this.baseUrl2}/categories`);
  }

  createCategory(data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories`, data);
  }

  deleteCategories(ids: string[]) {
    return this.http.delete(`${this.baseUrl}/categories`, {
      body: { categoryIds: ids },
    });
  }

  /**
   * =========================
   * FETCH ALL VIDEOS (ADMIN)
   * =========================
   * GET /api/admin/videos
   */
  getVideos(
    page = 1,
    limit = 25,
    q?: string,
    category?: string | null,
  ): Observable<PaginatedVideos> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (q && q.trim()) {
      params = params.set('q', q.trim());
    }

    if (category && category !== 'undefined') {
      params = params.set('category', category);
    }

    return this.http
      .get<PaginatedVideos>(`${this.baseUrl}/videos`, { params })
      .pipe(
        map((res) => ({
          ...res,
          page: Number(res.page) || 1,
          limit: Number(res.limit) || 25,
          total: Number(res.total) || 0,
          totalPages: Math.max(Number(res.totalPages) || 1, 1),
          results: Array.isArray(res.results)
            ? res.results.map((v) => ({
                ...v,
                duration: v.duration ?? null,
                views: Number(v.views) || 0,
              }))
            : [],
        })),
      );
  }

  /**
   * =========================
   * UPLOAD VIDEO
   * =========================
   * POST /api/admin/video
   */
  uploadVideo(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/video`, formData);
  }

  /**
   * =========================
   * UPDATE VIDEO (METADATA ONLY)
   * =========================
   * PUT /api/admin/video/:id
   */
  updateVideo(
    id: string,
    data: Partial<Pick<Video, 'title' | 'description' | 'category'>>,
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/video/${id}`, data);
  }

  /**
   * =========================
   * UPDATE VIDEO (WITH FILE)
   * =========================
   * PUT /api/admin/video/:id
   */
  updateVideoWithFile(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/video/${id}`, formData);
  }

  /**
   * =========================
   * DELETE VIDEO
   * =========================
   * DELETE /api/admin/video/:id
   */
  deleteVideo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/video/${id}`);
  }

  /**
   * =========================
   * TOGGLE ACTIVE / INACTIVE
   * =========================
   * PATCH /api/admin/video/:id/toggle
   */
  toggleVideo(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/video/${id}/toggle`, {});
  }
}
