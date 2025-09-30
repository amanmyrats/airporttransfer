import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogVideoPublicComponent } from './blog-video-public.component';

describe('BlogVideoPublicComponent', () => {
  let component: BlogVideoPublicComponent;
  let fixture: ComponentFixture<BlogVideoPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogVideoPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogVideoPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
