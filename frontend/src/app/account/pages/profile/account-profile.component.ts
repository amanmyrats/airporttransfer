import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UpdateProfilePayload } from '../../../auth/models/auth.models';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
    DropdownModule,
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
export class AccountProfileComponent {
  private readonly authService = inject(AuthService);
  readonly user = this.authService.user;
  readonly form: FormGroup;
  readonly loading = signal(false);

  readonly languages: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ru', label: 'Русский' },
    { code: 'tr', label: 'Türkçe' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
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
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: UpdateProfilePayload = {
      first_name: this.form.value.first_name,
      last_name: this.form.value.last_name,
      customer_profile: {
        phone_e164: this.form.value.phone_e164,
        preferred_language: this.form.value.preferred_language,
        marketing_opt_in: !!this.form.value.marketing_opt_in,
      },
    };
    this.loading.set(true);
    this.authService.updateMe(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Profile updated successfully.' });
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err?.error?.detail || 'Failed to update profile.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
      },
    });
  }
}
