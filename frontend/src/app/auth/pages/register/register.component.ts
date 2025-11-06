import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { RegisterPayload } from '../../models/auth.models';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { LanguageService } from '../../../services/language.service';

interface LanguageOption {
  code: 'en' | 'de' | 'ru' | 'tr';
  label: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SuperHeaderComponent, NavbarComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  readonly form: FormGroup;
  readonly loading = signal(false);
  readonly success = signal(false);
  readonly serverFieldErrors = signal<Record<string, string[]>>({});
  readonly serverGeneralErrors = signal<string[]>([]);
  readonly languages: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ru', label: 'Русский' },
    { code: 'tr', label: 'Türkçe' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly languageService: LanguageService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      first_name: [''],
      last_name: [''],
      preferred_language: [this.languages[0].code, Validators.required],
    });

    const lang = this.languageService.extractLangFromUrl(this.router.url);
    if (lang) {
      this.form.patchValue({ preferred_language: lang });
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.resetServerErrors();
    this.loading.set(true);
    const payload: RegisterPayload = {
      email: this.form.value.email,
      password: this.form.value.password,
      first_name: this.form.value.first_name || undefined,
      preferred_language: this.form.value.preferred_language,
    };
    console.log('Register payload:', payload);
    this.authApi.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.handleSubmitError(err);
        console.error('Registration error:', err);
      },
    });
  }

  navigateToLogin(): void {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    const target = this.languageService.withLangPrefix('auth/login', lang);
    this.router.navigateByUrl(target).catch(() => {});
  }

  get passwordControl() {
    return this.form.get('password');
  }

  fieldErrors(controlName: string): string[] {
    const errors: string[] = [];
    const control = this.form.get(controlName);
    if (!control) {
      return errors;
    }
    const controlErrors = control.errors;
    if (control.invalid && (control.touched || control.dirty) && controlErrors) {
      if (controlErrors['required']) {
        errors.push('This field is required.');
      }
      if (controlErrors['email']) {
        errors.push('Please enter a valid email address.');
      }
      if (controlErrors['minlength']) {
        const required = controlErrors['minlength'].requiredLength;
        errors.push(`Must be at least ${required} characters long.`);
      }
    }
    const serverErrors = this.serverFieldErrors()[controlName];
    if (serverErrors?.length) {
      errors.push(...serverErrors);
    }
    return errors;
  }

  controlInvalid(controlName: string): boolean {
    const serverErrorExists = !!this.serverFieldErrors()[controlName]?.length;
    const control = this.form.get(controlName);
    if (!control) {
      return serverErrorExists;
    }
    return (
      serverErrorExists ||
      (control.invalid && (control.touched || control.dirty))
    );
  }

  private resetServerErrors(): void {
    this.serverFieldErrors.set({});
    this.serverGeneralErrors.set([]);
  }

  private handleSubmitError(error: unknown): void {
    const fieldErrors: Record<string, string[]> = {};
    const generalErrors: string[] = [];

    const responseError = this.extractResponseError(error);

    if (typeof responseError === 'string') {
      generalErrors.push(responseError);
    } else if (responseError && typeof responseError === 'object') {
      const entries = Object.entries(responseError as Record<string, unknown>);
      if (!entries.length) {
        generalErrors.push('Registration failed. Please try again later.');
      }
      for (const [key, value] of entries) {
        const messages = this.normalizeErrorValue(value);
        if (!messages.length) {
          continue;
        }
        if (this.form.contains(key)) {
          fieldErrors[key] = messages;
        } else if (key === 'non_field_errors' || key === 'detail') {
          generalErrors.push(...messages);
        } else {
          generalErrors.push(...messages);
        }
      }
    } else {
      generalErrors.push('Registration failed. Please try again later.');
    }

    const hasFieldErrors = Object.keys(fieldErrors).length > 0;
    this.serverFieldErrors.set(fieldErrors);
    this.serverGeneralErrors.set(
      generalErrors.length ? generalErrors : hasFieldErrors ? [] : ['Registration failed. Please try again later.'],
    );
  }

  private extractResponseError(error: unknown): unknown {
    if (error instanceof HttpErrorResponse) {
      return error.error ?? error.message;
    }
    if (typeof error === 'object' && error !== null && 'error' in (error as Record<string, unknown>)) {
      return (error as Record<string, unknown>)['error'];
    }
    return error;
  }

  private normalizeErrorValue(value: unknown): string[] {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === 'string' ? item : String(item)));
    }
    if (typeof value === 'string') {
      return [value];
    }
    if (typeof value === 'object') {
      return Object.values(value)
        .map((item) => this.normalizeErrorValue(item))
        .flat();
    }
    return [String(value)];
  }
}
