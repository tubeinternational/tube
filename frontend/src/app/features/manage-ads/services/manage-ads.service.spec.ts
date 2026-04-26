import { TestBed } from '@angular/core/testing';

import { ManageAdsService } from './manage-ads.service';

describe('ManageAdsService', () => {
  let service: ManageAdsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageAdsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
