import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IstanbulAirportTransferComponent } from './istanbul-airport-transfer.component';

describe('IstanbulAirportTransferComponent', () => {
  let component: IstanbulAirportTransferComponent;
  let fixture: ComponentFixture<IstanbulAirportTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IstanbulAirportTransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IstanbulAirportTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
