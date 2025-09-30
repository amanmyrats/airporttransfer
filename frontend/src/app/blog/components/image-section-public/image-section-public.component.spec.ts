import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageSectionPublicComponent } from './image-section-public.component';

describe('ImageSectionPublicComponent', () => {
  let component: ImageSectionPublicComponent;
  let fixture: ComponentFixture<ImageSectionPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageSectionPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageSectionPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
