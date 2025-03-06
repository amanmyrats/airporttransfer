import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricesLoadingComponent } from './prices-loading.component';

describe('PricesLoadingComponent', () => {
  let component: PricesLoadingComponent;
  let fixture: ComponentFixture<PricesLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricesLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricesLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
