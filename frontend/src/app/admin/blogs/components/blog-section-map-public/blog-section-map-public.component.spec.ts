import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogSectionMapPublicComponent } from './blog-section-map-public.component';

describe('BlogSectionMapPublicComponent', () => {
  let component: BlogSectionMapPublicComponent;
  let fixture: ComponentFixture<BlogSectionMapPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogSectionMapPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogSectionMapPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
