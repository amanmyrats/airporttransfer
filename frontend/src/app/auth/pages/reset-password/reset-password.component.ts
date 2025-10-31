import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { ResetPasswordPayload } from '../../models/auth.models';
import { take } from 'rxjs/operators';
import { LanguageService } from '../../../services/language.service';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SuperHeaderComponent, NavbarComponent, FooterComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  readonly form: FormGroup;
  readonly loading = signal(false);
  readonly completed = signal(false);
  readonly statusMessage = signal<{ type: 'error'; text: string } | null>(null);
  private uid: string | null = null;
  private token: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly authApi: AuthApiService,
    private readonly router: Router,
    private readonly languageService: LanguageService,
  ) {
    this.form = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]],
    });

    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      this.uid = params.get('uid');
      this.token = params.get('token');
      if (!this.uid || !this.token) {
        this.statusMessage.set({ type: 'error', text: 'Password reset link is invalid or expired.' });
      }
    });
  }

  submit(): void {
    if (!this.uid || !this.token) {
      this.statusMessage.set({ type: 'error', text: 'Password reset link is invalid.' });
      return;
    }
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.value.new_password !== this.form.value.confirm_password) {
      this.statusMessage.set({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    this.statusMessage.set(null);
    const payload: ResetPasswordPayload = {
      uid: this.uid,
      token: this.token,
      new_password: this.form.value.new_password,
    };
    this.loading.set(true);
    this.authApi.resetPassword(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.completed.set(true);
        this.statusMessage.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err?.error?.detail || 'Reset failed. Please request a new reset link.';
        this.statusMessage.set({ type: 'error', text: detail });
      },
    });
  }

  goToLogin(): void {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    const target = this.languageService.withLangPrefix('auth/login', lang);
    this.router.navigateByUrl(target).catch(() => {});
  }
}
