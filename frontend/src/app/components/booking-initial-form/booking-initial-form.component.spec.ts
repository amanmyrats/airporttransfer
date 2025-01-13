import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingInitialFormComponent } from './booking-initial-form.component';

describe('BookingInitialFormComponent', () => {
  let component: BookingInitialFormComponent;
  let fixture: ComponentFixture<BookingInitialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingInitialFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingInitialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
