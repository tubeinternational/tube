import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdRendererComponent } from './ad-renderer.component';

describe('AdRendererComponent', () => {
  let component: AdRendererComponent;
  let fixture: ComponentFixture<AdRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
