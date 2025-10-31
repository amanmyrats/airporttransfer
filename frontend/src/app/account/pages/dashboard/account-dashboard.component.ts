import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-account-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './account-dashboard.component.html',
  styleUrl: './account-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDashboardComponent {
  private readonly authService = inject(AuthService);
  readonly user = this.authService.user;
}
