import { TestBed } from '@angular/core/testing';

import { AdminVideoService } from './admin-video.service';

describe('AdminVideoService', () => {
  let service: AdminVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminVideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
