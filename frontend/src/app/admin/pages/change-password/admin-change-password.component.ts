import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChangePasswordComponent } from '../../../auth/pages/change-password/change-password.component';

@Component({
  selector: 'app-admin-change-password',
  standalone: true,
  imports: [ChangePasswordComponent],
  template: `
    <section class="admin-change-password">
      <h2>Change Password</h2>
      <app-auth-change-password></app-auth-change-password>
    </section>
  `,
  styles: [
    `
      .admin-change-password {
        max-width: 560px;
        margin: 0 auto;
        padding: 1rem;
      }

      h2 {
        margin-bottom: 1rem;
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminChangePasswordComponent {}
