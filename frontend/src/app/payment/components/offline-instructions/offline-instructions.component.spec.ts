import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineInstructionsComponent } from './offline-instructions.component';

describe('OfflineInstructionsComponent', () => {
  let component: OfflineInstructionsComponent;
  let fixture: ComponentFixture<OfflineInstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineInstructionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineInstructionsComponent);
    component = fixture.componentInstance;
    component.instruction = {
      reference_text: 'BOOK123',
      expires_at: null,
      metadata: null,
      bank_accounts: [
        {
          id: 1,
          label: 'Primary Account',
          method: 'BANK_TRANSFER',
          currency: 'EUR',
          account_name: 'Airport Transfer',
          bank_name: 'Example Bank',
          iban: 'TR000',
          account_number: 'ACC123',
          swift_code: 'SWIFTBIC',
          branch_code: '001',
          phone_number: '',
          reference_hint: null,
          metadata: null,
          priority: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    };
    component.amountMinor = 15000;
    component.currency = 'EUR';
    component.bookingRef = 'BOOK123';
    fixture.detectChanges();
  });

  it('emits confirmTransfer when CTA clicked', () => {
    const spy = jasmine.createSpy('confirm');
    component.confirmTransfer.subscribe(spy);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.cta');
    button.click();
    expect(spy).toHaveBeenCalled();
  });

  it('shows processing message when status equals processing', () => {
    component.status = 'processing';
    fixture.detectChanges();
    const statusText: HTMLElement = fixture.nativeElement.querySelector('.status');
    expect(statusText.textContent).toContain('reviewing');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.cta');
    expect(button.disabled).toBeTrue();
  });
});
