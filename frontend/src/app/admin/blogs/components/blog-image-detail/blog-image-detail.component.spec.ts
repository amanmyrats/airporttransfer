import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogImageDetailComponent } from './blog-image-detail.component';

describe('BlogImageDetailComponent', () => {
  let component: BlogImageDetailComponent;
  let fixture: ComponentFixture<BlogImageDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogImageDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogImageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
