import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceListPlaceholderComponent } from './price-list-placeholder.component';

describe('PriceListPlaceholderComponent', () => {
  let component: PriceListPlaceholderComponent;
  let fixture: ComponentFixture<PriceListPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceListPlaceholderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceListPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
