import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Params, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { BookingService } from '../../../services/booking.service';

@Injectable({
  providedIn: 'root',
})
export class BookingStepGuard implements CanActivate {
  constructor(
    private readonly bookingService: BookingService,
    private readonly router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const requiredStep = Number(route.data['step']) || 1;
    const params = route.queryParams;

    this.bookingService.applyStepOneParams(params);
    this.bookingService.applyDistanceParams(params);

    if (requiredStep === 2) {
      return this.hasStepOneData()
        ? true
        : this.redirectToStep(1, state.url, params);
    }

    if (requiredStep === 3) {
      this.bookingService.applyStepTwoParams(params);

      if (!this.hasStepOneData()) {
        return this.redirectToStep(1, state.url, params);
      }

      if (!this.hasStepTwoData()) {
        return this.redirectToStep(2, state.url, params);
      }

      return true;
    }

    return true;
  }

  private hasStepOneData(): boolean {
    const pickup = this.bookingService.bookingInitialForm.get('pickup_full')?.value;
    const dest = this.bookingService.bookingInitialForm.get('dest_full')?.value;
    const distance = this.bookingService.bookingCarTypeSelectionForm.get('distance')?.value;

    return Boolean(pickup && dest && distance !== null && distance !== undefined);
  }

  private hasStepTwoData(): boolean {
    const carType = this.bookingService.bookingCarTypeSelectionForm.get('car_type')?.value;
    const amount = this.bookingService.bookingCarTypeSelectionForm.get('amount')?.value;
    return Boolean(carType && amount !== null && amount !== undefined);
  }

  private redirectToStep(step: number, currentUrl: string, params: Params): UrlTree {
    const baseSegments = this.getBaseSegments(currentUrl);

    if (step === 1) {
      // remove any child segment
      baseSegments.pop();
    } else if (step === 2) {
      baseSegments.pop();
      baseSegments.push('car-selection');
    } else if (step === 3) {
      baseSegments.pop();
      baseSegments.push('completion');
    }

    const queryParams = { ...params, step };
    return this.router.createUrlTree(['/', ...baseSegments], { queryParams });
  }

  private getBaseSegments(url: string): string[] {
    const [path] = url.split('?');
    return path.split('/').filter((segment) => segment.length > 0);
  }
}
