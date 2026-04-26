// features/admin/manage-ads/services/manage-ads.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Ad,
  AdDevice,
  AdPlacement,
  AdsResponse,
  AdsQueryParams,
  CreateAdPayload,
  UpdateAdPayload,
} from '../models/manage-ads.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ManageAdsService {
  private readonly baseUrl = `${environment.baseUrl}/ads`;

  constructor(private http: HttpClient) {}

  /**
   * =========================
   * GET ADS (with filters)
   * =========================
   */
  getAds(params?: AdsQueryParams): Observable<AdsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.placement) {
        httpParams = httpParams.set('placement', params.placement);
      }

      if (params.device) {
        httpParams = httpParams.set('device', params.device);
      }

      if (params.active !== undefined) {
        httpParams = httpParams.set('active', params.active);
      }

      if (params.page) {
        httpParams = httpParams.set('page', params.page);
      }

      if (params.limit) {
        httpParams = httpParams.set('limit', params.limit);
      }
    }

    return this.http.get<AdsResponse>(this.baseUrl, {
      params: httpParams,
    });
  }

  /**
   * =========================
   * GET ADS BY PLACEMENT (CLIENT-SIDE)
   * =========================
   * Production helper: fetches all ads and filters by placement + device
   * This is useful when you want flexible filtering on the frontend
   */
  getAdsByPlacement(
    placement: AdPlacement,
    device?: AdDevice,
  ): Observable<Ad[]> {
    return this.getAds({
      placement,
      device: device || this.getDeviceType(),
      active: true,
    }).pipe(
      map((response) => {
        const ads = response.results || [];
        // Sort by priority (highest first)
        return ads.sort((a, b) => b.priority - a.priority);
      }),
    );
  }

  /**
   * =========================
   * GET ADS BY MULTIPLE PLACEMENTS
   * =========================
   * Fetch ads for multiple placements at once
   */
  getAdsByPlacements(
    placements: AdPlacement[],
    device?: AdDevice,
  ): Observable<Ad[]> {
    return this.getAds({
      device: device || this.getDeviceType(),
      active: true,
    }).pipe(
      map((response) => {
        const ads = response.results || [];
        // Filter by placements and sort by priority
        return ads
          .filter((ad) => placements.includes(ad.placement))
          .sort((a, b) => b.priority - a.priority);
      }),
    );
  }

  /**
   * =========================
   * GET DEVICE TYPE
   * =========================
   * Detect if user is on mobile or desktop
   */
  getDeviceType(): AdDevice {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
      userAgent,
    );
    return isMobile ? 'MOBILE' : 'DESKTOP';
  }

  /**
   * =========================
   * GET SINGLE AD
   * =========================
   */
  getAdById(id: number): Observable<Ad> {
    return this.http.get<Ad>(`${this.baseUrl}/${id}`);
  }

  /**
   * =========================
   * CREATE AD
   * =========================
   */
  createAd(payload: CreateAdPayload): Observable<Ad> {
    return this.http.post<Ad>(this.baseUrl, payload);
  }

  /**
   * =========================
   * UPDATE AD
   * =========================
   */
  updateAd(id: number, payload: UpdateAdPayload): Observable<Ad> {
    return this.http.put<Ad>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * =========================
   * DELETE AD
   * =========================
   */
  deleteAd(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }

  /**
   * =========================
   * TOGGLE ACTIVE
   * =========================
   */
  toggleAd(id: number): Observable<Ad> {
    return this.http.patch<Ad>(`${this.baseUrl}/${id}/toggle`, {});
  }
}

