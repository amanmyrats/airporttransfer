import { Component, inject, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { BookingInitialFormComponent } from '../../components/booking-initial-form/booking-initial-form.component';
import { BookingCompletionFormComponent } from '../../components/booking-completion-form/booking-completion-form.component';
import { BookingCarTypeSelectionFormComponent } from '../../components/booking-car-type-selection-form/booking-car-type-selection-form.component';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { LanguageService } from '../../services/language.service';
import { usePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';


@Component({
  selector: 'app-booking',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
    ButtonModule, StepperModule, 
    BookingInitialFormComponent, 
    BookingCarTypeSelectionFormComponent, 
    BookingCompletionFormComponent, 
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  bookingService = inject(BookingService);
  activeStep: number = 1;
  stepFromUrl: number | null = null;

  constructor(
    private route: ActivatedRoute, 
    public languageService: LanguageService, 
  ) { }

  ngOnInit(): void {
    console.log('BookingComponent initialized');
    this.route.queryParams.subscribe((params) => {
      if (params['step'] === '2') {
        this.prefillStep1Data(params);
        this.stepFromUrl = 2; // Start from step 2
        this.activeStep = this.stepFromUrl;
      }
      if (params['step'] === '3') {
        this.prefillStep1Data(params);
        this.prefillStep2Data(params);
        this.stepFromUrl = 3;
        this.activeStep = this.stepFromUrl; // Start from step 3
      }
    });
    usePreset(Aura);
  }

  prefillStep1Data(params: any): void {
    this.bookingService.bookingInitialForm.patchValue({
      pickup_full: params['pickup_full'],
      pickup_lat: params['pickup_lat'],
      pickup_lng: params['pickup_lng'],
      dest_full: params['dest_full'],
      dest_lat: params['dest_lat'],
      dest_lng: params['dest_lng'],
    });
    this.bookingService.bookingCarTypeSelectionForm.patchValue({
      distance: params['distance'],
      driving_duration: params['driving_duration'],
    });
  }

  prefillStep2Data(params: any): void {
    this.bookingService.bookingCarTypeSelectionForm.patchValue({
      car_type: params['car_type'],
      amount: params['amount'],
      currency_code: params['currency_code'],
    });
  }

  goToStep(event: any, fromStep: number, toStep: number): void {
    console.log('Navigating fromStep:', fromStep);
    console.log('Navigating toStep:', toStep);
    console.log('Event:', event);
    this.activeStep = toStep;
  }

  translations: any = {
    destination: {
      en: 'Destination',
      de: 'Ziel',
      ru: 'Место назначения',
      tr: 'Gidilecek Yer',
    },
    vehicle: {
      en: 'Vehicle',
      de: 'Fahrzeug',
      ru: 'Транспортное средство',
      tr: 'Araç',
    }, 
    personal: {
      en: 'Personal Info', 
      de: 'Persönliche Informationen',
      ru: 'Личная информация',
      tr: 'Kişisel Bilgiler',
    }, 
    back: {
      en: 'Back', 
      de: 'Zurück',
      ru: 'Назад',
      tr: 'Geri',
    },
  }

}
