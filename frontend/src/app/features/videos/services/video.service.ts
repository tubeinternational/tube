import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { PaginatedVideos, Video } from '../models/video.model';
import { environment } from '../../../../environments/environment';

function normalizeVideo(video: Video): Video {
  return {
    ...video,
    duration: video.duration ?? null,
    views: Number(video.views) || 0,
  };
}

function normalizePaginatedVideos(
  response: Partial<PaginatedVideos>,
): PaginatedVideos {
  return {
    results: Array.isArray(response.results)
      ? response.results.map((video) => normalizeVideo(video))
      : [],
    page: Number(response.page) || 1,
    limit: Number(response.limit) || 25,
    total: Number(response.total) || 0,
    totalPages: Math.max(Number(response.totalPages) || 1, 1),
  };
}

@Injectable({ providedIn: 'root' })
export class VideoService {
  private readonly API_URL = `${environment.baseUrl}/videos`;

  constructor(private http: HttpClient) {}

  getVideos(params: {
    page?: number;
    limit?: number;
    q?: string;
    category?: string;
    country?: string;
    sort?: 'latest' | 'trending' | 'views';
  }): Observable<PaginatedVideos> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit)
      httpParams = httpParams.set('limit', String(params.limit));
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.category)
      httpParams = httpParams.set('category', params.category);
    if (params.country) httpParams = httpParams.set('country', params.country);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.http
      .get<PaginatedVideos>(`${environment.baseUrl}/videos`, {
        params: httpParams,
      })
      .pipe(map((response) => normalizePaginatedVideos(response)));
  }

  getVideoBySlug(slug: string) {
    return this.http.get<Video>(`${this.API_URL}/slug/${slug}`).pipe(
      map((video) => normalizeVideo(video)),
    );
  }

  getVideoById(id: string) {
    return this.http
      .get<Video>(`${this.API_URL}/${id}`)
      .pipe(map((video) => normalizeVideo(video)));
  }

  incrementViews(id: string) {
    return this.http.post(`${this.API_URL}/${id}/view`, {}, {
      withCredentials: true,
    });
  }

  getRelatedVideos(id: string) {
    return this.http.get<Video[]>(`${this.API_URL}/${id}/related`).pipe(
      map((videos) => videos.map((video) => normalizeVideo(video))),
    );
  }
}
