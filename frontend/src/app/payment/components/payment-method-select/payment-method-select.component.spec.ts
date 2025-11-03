import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodSelectComponent } from './payment-method-select.component';

describe('PaymentMethodSelectComponent', () => {
  let fixture: ComponentFixture<PaymentMethodSelectComponent>;
  let component: PaymentMethodSelectComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentMethodSelectComponent);
    component = fixture.componentInstance;
    component.methods = [
      { method: 'CASH', currencies: ['EUR'], provider: 'offline', metadata: {} },
      { method: 'CARD', currencies: ['EUR'], provider: 'stripe', metadata: {} },
    ];
    fixture.detectChanges();
  });

  it('emits methodSelected when option clicked', () => {
    const spy = jasmine.createSpy('methodSelected');
    component.methodSelected.subscribe(spy);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    expect(spy).toHaveBeenCalledOnceWith('CASH');
  });

  it('marks selected method', () => {
    component.selected = 'CARD';
    fixture.detectChanges();
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[1].classList).toContain('selected');
  });
});
