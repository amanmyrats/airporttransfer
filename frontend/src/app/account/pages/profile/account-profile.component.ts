import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Inject, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgxIntlTelInputModule, CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { AuthService } from '../../../auth/services/auth.service';
import { UpdateProfilePayload } from '../../../auth/models/auth.models';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface LanguageOption {
  code: 'en' | 'de' | 'ru' | 'tr';
  label: string;
}

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxIntlTelInputModule,
    SelectModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    CardModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './account-profile.component.html',
  styleUrl: './account-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly user = this.authService.user;
  readonly form: FormGroup;
  readonly loading = signal(false);
  readonly serverErrors = signal<Record<string, string>>({});

  defaultCountry: CountryISO = CountryISO.UnitedStates;
  selectedCountryISO: CountryISO = this.defaultCountry;
  readonly preferredCountries: CountryISO[] = [
    CountryISO.Turkey,
    CountryISO.Germany,
    CountryISO.Netherlands,
    CountryISO.Switzerland,
    CountryISO.Russia,
    CountryISO.UnitedKingdom,
    CountryISO.Ukraine,
    CountryISO.Kazakhstan,
    CountryISO.UnitedStates,
    CountryISO.Austria,
    CountryISO.France,
    CountryISO.Italy,
    CountryISO.Spain,
    CountryISO.Poland,
    CountryISO.Romania,
    CountryISO.Bulgaria,
    CountryISO.CzechRepublic,
  ];
  readonly searchFields: SearchCountryField[] = [
    SearchCountryField.All,
    SearchCountryField.Iso2,
    SearchCountryField.DialCode,
  ];

  readonly languages: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ru', label: 'Русский' },
    { code: 'tr', label: 'Türkçe' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    @Inject(PLATFORM_ID) _platformId: object,
  ) {
    const user = this.user();
    const profile = user?.customer_profile;
    this.form = this.fb.group({
      first_name: [user?.first_name || '', [Validators.required]],
      last_name: [user?.last_name || ''],
      phone_e164: [profile?.phone_e164 || ''],
      preferred_language: [profile?.preferred_language || 'en', Validators.required],
      marketing_opt_in: [profile?.marketing_opt_in ?? false],
    });

    if (profile?.phone_e164) {
      this.applyInitialPhoneValue(profile.phone_e164);
    }

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.clearServerErrors();
    });
  }

  ngOnInit(): void {
    if (!this.form.get('phone_e164')?.value) {
      this.detectUserCountry();
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.clearServerErrors();
    const phoneValue = this.form.value.phone_e164;
    const phoneE164 = this.resolvePhoneE164(phoneValue);
    const payload: UpdateProfilePayload = {
      first_name: this.form.value.first_name,
      last_name: this.form.value.last_name,
      profile: {
        phone_e164: phoneE164 ?? undefined,
        preferred_language: this.form.value.preferred_language,
        marketing_opt_in: !!this.form.value.marketing_opt_in,
      },
    };
    this.loading.set(true);
    this.authService.updateMe(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.clearServerErrors();
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Profile updated successfully.' });
      },
      error: (err) => {
        this.loading.set(false);
        const { detail, fieldErrors } = this.extractServerErrors(err?.error);
        this.serverErrors.set(fieldErrors);
        this.applyFieldErrors(fieldErrors);
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
      },
    });
  }

  private applyInitialPhoneValue(rawPhone: string): void {
    const parsed = parsePhoneNumberFromString(rawPhone);
    if (parsed) {
      const country = this.resolveCountryISO(parsed.country);
      if (country) {
        this.selectedCountryISO = country;
        this.defaultCountry = country;
        this.cdr.markForCheck();
      }
      this.form.patchValue(
        {
          phone_e164: {
            number: parsed.nationalNumber ?? parsed.number,
            internationalNumber: parsed.formatInternational(),
            nationalNumber: parsed.nationalNumber ?? parsed.formatNational(),
            e164Number: parsed.number,
            countryCode: parsed.country ? parsed.country.toLowerCase() : undefined,
            dialCode: `+${parsed.countryCallingCode}`,
          },
        },
        { emitEvent: false },
      );
      this.cdr.markForCheck();
      return;
    }
    this.form.patchValue({ phone_e164: rawPhone }, { emitEvent: false });
  }

  private detectUserCountry(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.http
      .get<{ country_code?: string; country_calling_code?: string }>('https://ipapi.co/json/')
      .subscribe({
        next: response => {
          const detected = this.resolveCountryISO(response.country_code);
          if (detected) {
            this.defaultCountry = detected;
            this.selectedCountryISO = detected;
            this.form.patchValue({ phone_e164: { countryCode: detected } }, { emitEvent: false });
            this.cdr.markForCheck();
          } else {
            this.applyBrowserLanguageFallback();
          }
        },
        error: () => {
          console.log('Failed to detect country from IP, falling back to browser language.');
          this.applyBrowserLanguageFallback();
        },
      });
  }

  private applyBrowserLanguageFallback(): void {
    if (typeof navigator === 'undefined' || !navigator.language) {
      return;
    }
    const parts = navigator.language.split('-');
    const region = parts.length > 1 ? parts[1] : parts[0];
    const mapped = this.resolveCountryISO(region);
    if (mapped) {
      this.defaultCountry = mapped;
      this.selectedCountryISO = mapped;
      this.cdr.markForCheck();
    }
  }

  private resolveCountryISO(code?: string | null): CountryISO | undefined {
    if (!code) {
      return undefined;
    }
    const upper = code.toUpperCase();
    const entry = Object.entries(CountryISO).find(([, value]) => value.toUpperCase() === upper);
    if (!entry) {
      return undefined;
    }
    return CountryISO[entry[0] as keyof typeof CountryISO];
  }

  private resolvePhoneE164(value: unknown): string | null {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      return value.trim() || null;
    }
    const asRecord = value as Record<string, unknown>;
    const e164 = asRecord['e164Number'] ?? asRecord['internationalNumber'] ?? asRecord['number'];
    if (typeof e164 === 'string' && e164.trim().length > 0) {
      return e164.trim();
    }
    return null;
  }

  private extractServerErrors(error: unknown): { detail: string; fieldErrors: Record<string, string> } {
    const fallback = 'Failed to update profile.';
    if (!error || typeof error !== 'object') {
      return { detail: fallback, fieldErrors: {} };
    }
    const response = error as Record<string, unknown>;
    const detail = typeof response['detail'] === 'string' && response['detail']?.toString().trim()
      ? String(response['detail'])
      : fallback;

    const fieldErrors: Record<string, string> = {};
    const collect = (data: unknown, prefix = ''): void => {
      if (!data) {
        return;
      }
      if (Array.isArray(data) && data.length) {
        const first = data[0];
        if (typeof first === 'string' && first.trim()) {
          fieldErrors[prefix] = first;
        }
        return;
      }
      if (typeof data === 'string' && data.trim()) {
        fieldErrors[prefix] = data;
        return;
      }
      if (typeof data === 'object') {
        Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
          const nextKey = prefix ? `${prefix}.${key}` : key;
          collect(value, nextKey);
        });
      }
    };

    Object.entries(response).forEach(([field, value]) => {
      if (field === 'detail') {
        return;
      }
      collect(value, field);
    });

    const normalized: Record<string, string> = {};
    Object.entries(fieldErrors).forEach(([key, message]) => {
      const normalizedKey = key.replace(/^profile\./, '');
      normalized[normalizedKey] = message;
    });
    return { detail, fieldErrors: normalized };
  }

  private applyFieldErrors(errors: Record<string, string>): void {
    Object.entries(errors).forEach(([field, message]) => {
      const control = this.form.get(field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), server: message });
        control.markAsTouched();
      }
    });
  }

  private clearServerErrors(): void {
    if (!Object.keys(this.serverErrors()).length) {
      return;
    }
    this.serverErrors.set({});
    Object.values(this.form.controls).forEach(control => {
      if (control.errors?.['server']) {
        const { server, ...rest } = control.errors;
        control.setErrors(Object.keys(rest).length ? rest : null);
      }
    });
  }
}
