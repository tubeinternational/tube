// features/admin/manage-ads/models/manage-ads.model.ts

export type AdPlacement =
  | 'HOME_TOP'
  | 'HOME_GRID'
  | 'VIDEO_TOP'
  | 'VIDEO_BELOW'
  | 'FOOTER';

export type AdDevice = 'ALL' | 'MOBILE' | 'DESKTOP';

export type AdType = 'SCRIPT' | 'HTML' | 'IFRAME';

export interface Ad {
  id: number;

  name: string;

  placement: AdPlacement;

  type: AdType;

  code: string;

  device: AdDevice;

  is_active: boolean;

  priority: number;

  start_date?: string | null;
  end_date?: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateAdPayload {
  name: string;
  placement: AdPlacement;
  type?: AdType;
  code: string;
  device?: AdDevice;
  is_active?: boolean;
  priority?: number;
  start_date?: string | null;
  end_date?: string | null;
}

export interface UpdateAdPayload extends CreateAdPayload {}

export interface AdsQueryParams {
  placement?: AdPlacement;
  device?: AdDevice;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface AdsResponse {
  results: Ad[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}