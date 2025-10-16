import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogDetailPublicComponent } from './blog-detail-public.component';

describe('BlogDetailPublicComponent', () => {
  let component: BlogDetailPublicComponent;
  let fixture: ComponentFixture<BlogDetailPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogDetailPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogDetailPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
