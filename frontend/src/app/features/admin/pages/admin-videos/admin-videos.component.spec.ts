import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVideosComponent } from './admin-videos.component';

describe('AdminVideosComponent', () => {
  let component: AdminVideosComponent;
  let fixture: ComponentFixture<AdminVideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminVideosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
