import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogImageTranslationFormComponent } from './blog-image-translation-form.component';

describe('BlogImageTranslationFormComponent', () => {
  let component: BlogImageTranslationFormComponent;
  let fixture: ComponentFixture<BlogImageTranslationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogImageTranslationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogImageTranslationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
