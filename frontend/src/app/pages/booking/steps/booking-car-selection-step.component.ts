import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BookingCarTypeSelectionFormComponent } from '../../../components/booking-car-type-selection-form/booking-car-type-selection-form.component';
import { BookingService } from '../../../services/booking.service';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-booking-car-selection-step',
  standalone: true,
  imports: [BookingCarTypeSelectionFormComponent],
  template: `
    <app-booking-car-type-selection-form
      [langInput]="langInput"
      (carTypeSelectionOutput)="onCarSelection($event)"
    ></app-booking-car-type-selection-form>

    <div class="booking-stageTEMPORARY_REMOVE__actions">
      <button
        type="button"
        class="booking-stageTEMPORARY_REMOVE__btn booking-stageTEMPORARY_REMOVE__btn--ghost"
        (click)="goBack()"
      >
        {{ backLabel }}
      </button>
    </div>
  `,
})
export class BookingCarSelectionStepComponent implements OnInit {
  langInput: any = { code: 'en' };
  backLabel = 'Back';

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
      this.backLabel = this.resolveBackLabel(detectedLang.code);
    } else {
      this.langInput = { code: langCode };
    }
  }

  onCarSelection(selection: any): void {
    const complete = typeof selection?.complete === 'function' ? selection.complete : undefined;
    const fail = typeof selection?.fail === 'function' ? selection.fail : undefined;

    const queryParams = {
      step: 3,
      car_type: selection?.car_type ?? this.bookingService.bookingCarTypeSelectionForm.get('car_type')?.value,
      amount: selection?.amount ?? this.bookingService.bookingCarTypeSelectionForm.get('amount')?.value,
      currency_code: selection?.currency_code ?? this.bookingService.bookingCarTypeSelectionForm.get('currency_code')?.value,
    };

    const extras: NavigationExtras = {
      relativeTo: this.route.parent ?? this.route,
      queryParams,
      queryParamsHandling: 'merge',
    };

    this.router
      .navigate(['completion'], extras)
      .then(() => complete?.())
      .catch((error) => {
        fail?.(error);
        return void 0;
      });
  }

  goBack(): void {
    const extras: NavigationExtras = {
      relativeTo: this.route,
      queryParams: { step: 1 },
      queryParamsHandling: 'merge',
    };
    this.router.navigate(['../'], extras).catch(() => void 0);
  }

  private resolveBackLabel(code?: string): string {
    switch (code) {
      case 'de':
        return 'Zurück';
      case 'ru':
        return 'Назад';
      case 'tr':
        return 'Geri';
      default:
        return 'Back';
    }
  }
}
