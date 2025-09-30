import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostTranslationFormComponent } from './blog-post-translation-form.component';

describe('BlogPostTranslationFormComponent', () => {
  let component: BlogPostTranslationFormComponent;
  let fixture: ComponentFixture<BlogPostTranslationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostTranslationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostTranslationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
