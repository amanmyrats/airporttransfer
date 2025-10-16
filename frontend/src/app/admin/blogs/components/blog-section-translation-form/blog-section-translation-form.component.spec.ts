import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogSectionTranslationFormComponent } from './blog-section-translation-form.component';

describe('BlogSectionTranslationFormComponent', () => {
  let component: BlogSectionTranslationFormComponent;
  let fixture: ComponentFixture<BlogSectionTranslationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogSectionTranslationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogSectionTranslationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
