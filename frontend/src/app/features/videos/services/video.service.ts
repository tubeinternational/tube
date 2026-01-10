import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedVideos, Video } from '../models/video.model';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private readonly API_URL = `${environment.baseUrl}/videos`;

  constructor(private http: HttpClient) {}

  getVideos(params: {
    page?: number;
    limit?: number;
    q?: string;
    category?: string;
  }) {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.category)
      httpParams = httpParams.set('category', params.category);

    return this.http.get<any>(`${environment.baseUrl}/videos`, {
      params: httpParams,
    });
  }

  getVideoBySlug(slug: string) {
    return this.http.get<Video>(`${this.API_URL}/slug/${slug}`).pipe(
      map((video) => ({
        ...video,
        views: Number(video.views) || 0,
      }))
    );
  }

  getVideoById(id: string) {
    return this.http.get<Video>(`${this.API_URL}/${id}`).pipe(
      map((v) => ({
        ...v,
        views: Number(v.views) || 0,
      }))
    );
  }

  incrementViews(id: string) {
    return this.http.post(
      `${this.API_URL}/${id}/view`,
      {},
      { withCredentials: true } // ✅ REQUIRED
    );
  }

  getRelatedVideos(id: string) {
    return this.http.get<Video[]>(`${this.API_URL}/${id}/related`).pipe(
      map((videos) =>
        videos.map((v) => ({
          ...v,
          views: Number(v.views) || 0,
        }))
      )
    );
  }
}
