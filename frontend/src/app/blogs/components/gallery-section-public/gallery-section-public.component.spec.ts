import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GallerySectionPublicComponent } from './gallery-section-public.component';

describe('GallerySectionPublicComponent', () => {
  let component: GallerySectionPublicComponent;
  let fixture: ComponentFixture<GallerySectionPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GallerySectionPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GallerySectionPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
