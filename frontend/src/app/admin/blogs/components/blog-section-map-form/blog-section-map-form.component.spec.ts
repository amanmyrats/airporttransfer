import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogSectionMapFormComponent } from './blog-section-map-form.component';

describe('BlogSectionMapFormComponent', () => {
  let component: BlogSectionMapFormComponent;
  let fixture: ComponentFixture<BlogSectionMapFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogSectionMapFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogSectionMapFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
