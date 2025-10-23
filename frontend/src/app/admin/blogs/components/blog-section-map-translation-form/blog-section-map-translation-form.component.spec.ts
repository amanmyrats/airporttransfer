import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogSectionMapTranslationFormComponent } from './blog-section-map-translation-form.component';

describe('BlogSectionMapTranslationFormComponent', () => {
  let component: BlogSectionMapTranslationFormComponent;
  let fixture: ComponentFixture<BlogSectionMapTranslationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogSectionMapTranslationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogSectionMapTranslationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
