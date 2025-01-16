import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlanyaGazipasaAirportTransferComponent } from './alanya-gazipasa-airport-transfer.component';

describe('AlanyaGazipasaAirportTransferComponent', () => {
  let component: AlanyaGazipasaAirportTransferComponent;
  let fixture: ComponentFixture<AlanyaGazipasaAirportTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlanyaGazipasaAirportTransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlanyaGazipasaAirportTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
