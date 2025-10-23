import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogImageFormComponent } from './blog-image-form.component';

describe('BlogImageFormComponent', () => {
  let component: BlogImageFormComponent;
  let fixture: ComponentFixture<BlogImageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogImageFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogImageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
