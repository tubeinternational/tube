import { TestBed } from '@angular/core/testing';

import { ShortsFeedService } from './shorts-feed.service';

describe('ShortsService', () => {
  let service: ShortsFeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShortsFeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
