import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BookingInitialFormComponent } from '../../../components/booking-initial-form/booking-initial-form.component';
import { BookingSearchEvent } from '../../../components/booking-form/booking-form.component';
import { LanguageService } from '../../../services/language.service';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-booking-initial-step',
  standalone: true,
  imports: [BookingInitialFormComponent],
  template: `
    <app-booking-initial-form
      [langInput]="langInput"
      (searchVehicle)="onSearchVehicle($event)"
    ></app-booking-initial-form>
  `,
})
export class BookingInitialStepComponent implements OnInit {
  langInput: any = { code: 'en' };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly bookingService: BookingService,
    private readonly languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    const parentRoute = this.route.parent ?? this.route;
    const langCode = parentRoute.snapshot.data['language'] || 'en';
    const detectedLang = this.languageService.getLanguageByCode(langCode);
    if (detectedLang) {
      this.langInput = detectedLang;
    } else {
      this.langInput = { code: langCode };
    }
  }

  onSearchVehicle(event: BookingSearchEvent): void {
    const { formValue, complete, fail } = event;
    const distance = this.bookingService.bookingCarTypeSelectionForm.get('distance')?.value;
    const drivingDuration = this.bookingService.bookingCarTypeSelectionForm.get('driving_duration')?.value;
    const airportCoefficient = this.bookingService.bookingInitialForm.get('airport_coefficient')?.value;

    const queryParams = {
      step: 2,
      pickup_short: formValue.pickup_short,
      dest_short: formValue.dest_short,
      pickup_full: formValue.pickup_full,
      pickup_lat: formValue.pickup_lat,
      pickup_lng: formValue.pickup_lng,
      dest_full: formValue.dest_full,
      dest_lat: formValue.dest_lat,
      dest_lng: formValue.dest_lng,
      is_from_popular_routes: formValue.is_from_popular_routes,
      is_switched_route: formValue.is_switched_route,
      distance,
      driving_duration: drivingDuration,
      airport_coefficient: airportCoefficient,
    };

    const extras: NavigationExtras = {
      relativeTo: this.route.parent ?? this.route,
      queryParams,
      queryParamsHandling: 'merge',
    };

    this.router
      .navigate(['car-selection'], extras)
      .then(() => complete())
      .catch((error) => fail(error));
  }
}
