import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialListPlaceholderComponent } from './testimonial-list-placeholder.component';

describe('TestimonialListPlaceholderComponent', () => {
  let component: TestimonialListPlaceholderComponent;
  let fixture: ComponentFixture<TestimonialListPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialListPlaceholderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialListPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
