import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogSectionMapDetailComponent } from './blog-section-map-detail.component';

describe('BlogSectionMapDetailComponent', () => {
  let component: BlogSectionMapDetailComponent;
  let fixture: ComponentFixture<BlogSectionMapDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogSectionMapDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogSectionMapDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
