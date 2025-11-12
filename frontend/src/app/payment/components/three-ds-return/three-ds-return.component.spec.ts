import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ThreeDsReturnComponent } from './three-ds-return.component';
import { PaymentIntentStore } from '../../services/payment-intent.store';

describe('ThreeDsReturnComponent', () => {
  let fixture: ComponentFixture<ThreeDsReturnComponent>;
  let router: Router;
  let store: jasmine.SpyObj<PaymentIntentStore>;

  beforeEach(async () => {
    store = jasmine.createSpyObj<PaymentIntentStore>('PaymentIntentStore', ['loadIntent', 'pollUntilTerminal'], {
      intent: () => null,
    });
    store.loadIntent.and.resolveTo(null);
    store.pollUntilTerminal.and.resolveTo({
      public_id: 'pi_123',
      status: 'succeeded',
    } as any);

    await TestBed.configureTestingModule({
      imports: [ThreeDsReturnComponent, RouterTestingModule],
      providers: [
        { provide: PaymentIntentStore, useValue: store },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({ intent: 'pi_123' }) },
            parent: { snapshot: { paramMap: convertToParamMap({ bookingRef: 'BOOK1' }) } },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(ThreeDsReturnComponent);
  });

  it('loads intent and navigates to result after polling', fakeAsync(() => {
    fixture.detectChanges();
    flushMicrotasks();
    expect(store.loadIntent).toHaveBeenCalledWith('pi_123');
    expect(store.pollUntilTerminal).toHaveBeenCalledWith('pi_123');
    expect(router.navigate).toHaveBeenCalledWith(
      ['../result'],
      jasmine.objectContaining({
        queryParams: { intent: 'pi_123' },
      }),
    );
  }));
});
