import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingFormPlaceholderComponent } from './booking-form-placeholder.component';

describe('BookingFormPlaceholderComponent', () => {
  let component: BookingFormPlaceholderComponent;
  let fixture: ComponentFixture<BookingFormPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingFormPlaceholderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingFormPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
