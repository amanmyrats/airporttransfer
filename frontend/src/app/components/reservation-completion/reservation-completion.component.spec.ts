import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationCompletionComponent } from './reservation-completion.component';

describe('ReservationCompletionComponent', () => {
  let component: ReservationCompletionComponent;
  let fixture: ComponentFixture<ReservationCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
