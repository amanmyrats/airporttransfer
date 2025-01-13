import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingReceivedComponent } from './booking-received.component';

describe('BookingReceivedComponent', () => {
  let component: BookingReceivedComponent;
  let fixture: ComponentFixture<BookingReceivedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingReceivedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingReceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
