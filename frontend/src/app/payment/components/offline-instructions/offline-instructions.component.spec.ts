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
      iban: 'TR000',
      account_name: 'Airport Transfer',
      bank_name: 'Example Bank',
      reference_text: 'BOOK123',
      expires_at: null,
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
