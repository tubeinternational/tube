import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortsFeedComponent } from './shorts-feed.component';

describe('ShortsFeedComponent', () => {
  let component: ShortsFeedComponent;
  let fixture: ComponentFixture<ShortsFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortsFeedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortsFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
