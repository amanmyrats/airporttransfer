import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogVideoCaptionFormComponent } from './blog-video-caption-form.component';

describe('BlogVideoCaptionFormComponent', () => {
  let component: BlogVideoCaptionFormComponent;
  let fixture: ComponentFixture<BlogVideoCaptionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogVideoCaptionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogVideoCaptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
