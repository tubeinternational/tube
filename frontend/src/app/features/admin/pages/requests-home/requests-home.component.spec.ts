import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsHomeComponent } from './requests-home.component';

describe('RequestsHomeComponent', () => {
  let component: RequestsHomeComponent;
  let fixture: ComponentFixture<RequestsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestsHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
