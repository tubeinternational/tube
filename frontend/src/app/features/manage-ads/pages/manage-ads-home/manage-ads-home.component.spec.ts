import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAdsHomeComponent } from './manage-ads-home.component';

describe('ManageAdsHomeComponent', () => {
  let component: ManageAdsHomeComponent;
  let fixture: ComponentFixture<ManageAdsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAdsHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAdsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
