import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortsPlayerComponent } from './shorts-player.component';

describe('ShortsPlayerComponent', () => {
  let component: ShortsPlayerComponent;
  let fixture: ComponentFixture<ShortsPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortsPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortsPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
