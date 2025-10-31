import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChangePasswordComponent } from '../../../auth/pages/change-password/change-password.component';

@Component({
  selector: 'app-account-change-password',
  standalone: true,
  imports: [ChangePasswordComponent],
  template: `
    <section class="account-change-password">
      <h2>Update Your Password</h2>
      <app-auth-change-password></app-auth-change-password>
    </section>
  `,
  styles: [
    `
      .account-change-password {
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
export class AccountChangePasswordComponent {}
