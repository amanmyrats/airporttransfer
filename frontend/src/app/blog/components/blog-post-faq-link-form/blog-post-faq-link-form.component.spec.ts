import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostFaqLinkFormComponent } from './blog-post-faq-link-form.component';

describe('BlogPostFaqLinkFormComponent', () => {
  let component: BlogPostFaqLinkFormComponent;
  let fixture: ComponentFixture<BlogPostFaqLinkFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostFaqLinkFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostFaqLinkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
