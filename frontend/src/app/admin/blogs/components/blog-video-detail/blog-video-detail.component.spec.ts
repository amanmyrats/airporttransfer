import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogVideoDetailComponent } from './blog-video-detail.component';

describe('BlogVideoDetailComponent', () => {
  let component: BlogVideoDetailComponent;
  let fixture: ComponentFixture<BlogVideoDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogVideoDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogVideoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
