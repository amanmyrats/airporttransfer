import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogListPlaceholderComponent } from './blog-list-placeholder.component';

describe('BlogListPlaceholderComponent', () => {
  let component: BlogListPlaceholderComponent;
  let fixture: ComponentFixture<BlogListPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogListPlaceholderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogListPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
