import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
import { Video } from '../../videos/models/video.model';

export interface ShortsFeedResponse {
  page: number;
  limit: number;
  hasMore: boolean;
  items: Video[];
}

export interface LikeResponse {
  liked: boolean;
  likes_count: number;
}

@Injectable({ providedIn: 'root' })
export class ShortsFeedService {
  private API = `${environment.baseUrl}/videos/shorts`;

  constructor(private http: HttpClient) {}

  getShorts(page = 1, limit = 15) {
    return this.http.get<ShortsFeedResponse>(this.API, {
      params: new HttpParams().set('page', page).set('limit', limit),
      withCredentials: true,
    });
  }

  like(videoId: string) {
    return this.http.post<LikeResponse>(
      `${environment.baseUrl}/videos/${videoId}/like`,
      {},
      { withCredentials: true }
    );
  }

  getShortBySlug(slug: string) {
    return this.http.get<Video>(
      `${environment.baseUrl}/videos/shorts/slug/${slug}`
    );
  }
}
