import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PaymentService } from './payment.service';
import { CreatePaymentIntentPayload } from '../models/payment.models';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('maps getMethods response into DTOs', () => {
    let result: any;
    service.getMethods().subscribe(value => (result = value));

    const req = httpMock.expectOne('/api/v1/payments/methods/');
    expect(req.request.method).toBe('GET');
    req.flush([
      { method: 'CARD', currencies: ['EUR'], provider: 'stripe', metadata: { publishable_key: 'pk' } },
    ]);

    expect(result[0]).toEqual({
      code: 'CARD',
      label: 'Credit or Debit Card',
      supportedCurrencies: ['EUR'],
      provider: 'stripe',
      metadata: { publishable_key: 'pk' },
    });
  });

  it('creates intents via POST', () => {
    const payload: CreatePaymentIntentPayload = {
      booking_ref: 'BOOK1',
      amount_minor: 1000,
      currency: 'EUR',
      method: 'CARD',
      idempotency_key: 'key',
    };
    service.createIntent(payload).subscribe();
    const req = httpMock.expectOne('/api/v1/payments/intents/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('confirms intent with empty payload by default', () => {
    service.confirm('public-id').subscribe();
    const req = httpMock.expectOne('/api/v1/payments/intents/public-id/confirm/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('uploads offline receipt as FormData', () => {
    const file = new File(['test'], 'receipt.pdf');
    service.uploadOfflineReceipt('pi', { evidence_file: file, note: 'note' }).subscribe();
    const req = httpMock.expectOne('/api/v1/payments/intents/pi/offline-receipt/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.get('note')).toBe('note');
    expect(req.request.body.get('evidence_file')).toBe(file);
    req.flush({});
  });
});
