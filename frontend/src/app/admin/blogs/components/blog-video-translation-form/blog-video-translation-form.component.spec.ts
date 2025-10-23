import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogVideoTranslationFormComponent } from './blog-video-translation-form.component';

describe('BlogVideoTranslationFormComponent', () => {
  let component: BlogVideoTranslationFormComponent;
  let fixture: ComponentFixture<BlogVideoTranslationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogVideoTranslationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogVideoTranslationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
