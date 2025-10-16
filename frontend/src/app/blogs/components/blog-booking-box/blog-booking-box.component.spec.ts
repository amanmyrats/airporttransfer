import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogBookingBoxComponent } from './blog-booking-box.component';

describe('BlogBookingBoxComponent', () => {
  let component: BlogBookingBoxComponent;
  let fixture: ComponentFixture<BlogBookingBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogBookingBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogBookingBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
