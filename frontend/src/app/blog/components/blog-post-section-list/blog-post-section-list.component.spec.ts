import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostSectionListComponent } from './blog-post-section-list.component';

describe('BlogPostSectionListComponent', () => {
  let component: BlogPostSectionListComponent;
  let fixture: ComponentFixture<BlogPostSectionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostSectionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostSectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
