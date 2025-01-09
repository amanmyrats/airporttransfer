import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationPdfComponent } from './reservation-pdf.component';

describe('ReservationPdfComponent', () => {
  let component: ReservationPdfComponent;
  let fixture: ComponentFixture<ReservationPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationPdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReservationPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
