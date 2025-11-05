import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FloatLabel } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-auth-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordModule, ButtonModule, FloatLabel],
  providers: [MessageService],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  readonly serverErrors = signal<Record<string, string>>({});
  readonly submitting = signal(false);

  readonly form: FormGroup = this.fb.group({
    old_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', Validators.required],
  }, { validators: this.passwordConfirmationValidator });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.clearServerErrors();
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.clearServerErrors();
    this.submitting.set(true);
    this.authService.changePassword(
      this.form.value.old_password,
      this.form.value.new_password,
      this.form.value.confirm_password,
    ).subscribe({
      next: () => {
        this.clearServerErrors();
        this.submitting.set(false);
        this.messageService.add({ severity: 'success', summary: 'Password changed', detail: 'Please sign in again.' });
        this.authService.logout().subscribe({
          next: () => this.router.navigate(['/auth/login']).catch(() => {}),
          error: () => this.router.navigate(['/auth/login']).catch(() => {}),
        });
      },
      error: (err) => {
        const { summary, detail, fieldErrors } = this.extractErrorMessage(err?.error);
        this.serverErrors.set(fieldErrors);
        this.messageService.add({ severity: 'error', summary, detail });
        this.applyFieldErrors(fieldErrors);
        this.submitting.set(false);
      },
    });
  }

  private passwordConfirmationValidator(group: FormGroup): void {
    const newPassword = group.get('new_password');
    const confirmPassword = group.get('confirm_password');
    if (!confirmPassword) {
      return;
    }
    if (newPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...(confirmPassword.errors || {}), passwordMismatch: true });
      return;
    }
    if (confirmPassword.errors?.['passwordMismatch']) {
      const { passwordMismatch, ...rest } = confirmPassword.errors;
      confirmPassword.setErrors(Object.keys(rest).length ? rest : null);
    }
  }

  private extractErrorMessage(error: unknown): { summary: string; detail: string; fieldErrors: Record<string, string> } {
    const fallback = {
      summary: 'Error',
      detail: 'Failed to change password.',
      fieldErrors: {} as Record<string, string>,
    };

    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const response = error as Record<string, unknown>;
    const fieldErrors: Record<string, string> = {};

    const detail = response['detail'];
    if (typeof detail === 'string' && detail.trim()) {
      return { summary: 'Error', detail, fieldErrors };
    }

    for (const [key, value] of Object.entries(response)) {
      if (Array.isArray(value) && value.length) {
        const first = value[0];
        if (typeof first === 'string' && first.trim()) {
          fieldErrors[key] = first;
        }
      } else if (typeof value === 'string' && value.trim()) {
        fieldErrors[key] = value;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      const first = fieldErrors[Object.keys(fieldErrors)[0]];
      return { summary: 'Please review the form', detail: first, fieldErrors };
    }

    return fallback;
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
