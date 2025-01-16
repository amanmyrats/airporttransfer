import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntalyaAirportTransferComponent } from './antalya-airport-transfer.component';

describe('AntalyaAirportTransferComponent', () => {
  let component: AntalyaAirportTransferComponent;
  let fixture: ComponentFixture<AntalyaAirportTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntalyaAirportTransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AntalyaAirportTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
