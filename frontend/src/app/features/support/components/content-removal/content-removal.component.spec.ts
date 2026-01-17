import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentRemovalComponent } from './content-removal.component';

describe('ContentRemovalComponent', () => {
  let component: ContentRemovalComponent;
  let fixture: ComponentFixture<ContentRemovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentRemovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentRemovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
