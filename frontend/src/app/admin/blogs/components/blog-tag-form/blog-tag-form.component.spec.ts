import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogTagFormComponent } from './blog-tag-form.component';

describe('BlogTagFormComponent', () => {
  let component: BlogTagFormComponent;
  let fixture: ComponentFixture<BlogTagFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogTagFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogTagFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
