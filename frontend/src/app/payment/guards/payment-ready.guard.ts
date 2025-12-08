import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { PaymentIntentStore } from '../services/payment-intent.store';

@Injectable({ providedIn: 'root' })
class PaymentReadyGuardImpl {
  private readonly store = inject(PaymentIntentStore);
  private readonly router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const bookingRef = route.paramMap.get('bookingRef');
    const language = route.data?.['language'] ?? null;
    if (!bookingRef) {
      await this.router.navigateByUrl('/');
      return false;
    }
    const ok = await this.store.bootstrap(bookingRef, language);
    if (!ok) {
      await this.router.navigateByUrl('/');
    }
    return ok;
  }
}

export const paymentReadyGuard: CanActivateFn = (route) =>
  inject(PaymentReadyGuardImpl).canActivate(route);
