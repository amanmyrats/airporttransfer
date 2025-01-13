import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCarTypeSelectionFormComponent } from './booking-car-type-selection-form.component';

describe('BookingCarTypeSelectionFormComponent', () => {
  let component: BookingCarTypeSelectionFormComponent;
  let fixture: ComponentFixture<BookingCarTypeSelectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCarTypeSelectionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCarTypeSelectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
