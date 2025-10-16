import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostPreviewComponent } from './blog-post-preview.component';

describe('BlogPostPreviewComponent', () => {
  let component: BlogPostPreviewComponent;
  let fixture: ComponentFixture<BlogPostPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
