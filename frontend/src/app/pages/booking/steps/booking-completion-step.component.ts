import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BookingCompletionFormComponent } from '../../../components/booking-completion-form/booking-completion-form.component';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-booking-completion-step',
  standalone: true,
  imports: [BookingCompletionFormComponent],
  template: `
    <app-booking-completion-form
      [langInput]="langInput"
      (previousStep)="goToCarSelection()"
    ></app-booking-completion-form>
  `,
})
export class BookingCompletionStepComponent implements OnInit {
  langInput: any = { code: 'en' };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
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

  goToCarSelection(): void {
    const extras: NavigationExtras = {
      relativeTo: this.route,
      queryParams: { step: 2 },
      queryParamsHandling: 'merge',
    };
    this.router.navigate(['../car-selection'], extras).catch(() => void 0);
  }
}
