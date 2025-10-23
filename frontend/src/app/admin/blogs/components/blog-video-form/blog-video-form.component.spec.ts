import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogVideoFormComponent } from './blog-video-form.component';

describe('BlogVideoFormComponent', () => {
  let component: BlogVideoFormComponent;
  let fixture: ComponentFixture<BlogVideoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogVideoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogVideoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
