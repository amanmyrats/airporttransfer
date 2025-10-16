import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostSectionFormComponent } from './blog-post-section-form.component';

describe('BlogPostSectionFormComponent', () => {
  let component: BlogPostSectionFormComponent;
  let fixture: ComponentFixture<BlogPostSectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostSectionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostSectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
