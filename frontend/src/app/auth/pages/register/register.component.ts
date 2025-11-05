import { CommonModule } from '@angular/common';
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
  readonly statusMessage = signal<{ type: 'error' | 'info'; text: string } | null>(null);
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
    this.statusMessage.set(null);
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
        this.statusMessage.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err?.error?.detail || 'Registration failed. Please try again later.';
        this.statusMessage.set({ type: 'error', text: detail });
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
}
