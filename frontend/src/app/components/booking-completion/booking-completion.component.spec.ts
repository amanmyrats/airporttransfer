import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCompletionComponent } from './booking-completion.component';

describe('BookingCompletionComponent', () => {
  let component: BookingCompletionComponent;
  let fixture: ComponentFixture<BookingCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
