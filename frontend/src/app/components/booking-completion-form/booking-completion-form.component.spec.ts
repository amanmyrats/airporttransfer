import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCompletionFormComponent } from './booking-completion-form.component';

describe('BookingCompletionFormComponent', () => {
  let component: BookingCompletionFormComponent;
  let fixture: ComponentFixture<BookingCompletionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCompletionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCompletionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
