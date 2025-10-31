import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FloatLabel } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../services/auth.service';

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

  readonly form: FormGroup = this.fb.group({
    old_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', Validators.required],
  }, { validators: this.passwordConfirmationValidator });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authService.changePassword(
      this.form.value.old_password,
      this.form.value.new_password,
      this.form.value.confirm_password,
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Password changed', detail: 'Please sign in again.' });
        this.authService.logout().subscribe({
          next: () => this.router.navigate(['/auth/login']).catch(() => {}),
          error: () => this.router.navigate(['/auth/login']).catch(() => {}),
        });
      },
      error: (err) => {
        const detail = err?.error?.detail || 'Failed to change password.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
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
}
