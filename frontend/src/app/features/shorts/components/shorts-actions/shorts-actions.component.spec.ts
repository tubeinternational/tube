import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortsActionsComponent } from './shorts-actions.component';

describe('ShortsActionsComponent', () => {
  let component: ShortsActionsComponent;
  let fixture: ComponentFixture<ShortsActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortsActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortsActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
