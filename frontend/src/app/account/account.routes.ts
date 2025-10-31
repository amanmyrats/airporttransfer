import { Routes } from '@angular/router';
import { AccountShellComponent } from './pages/account-shell/account-shell.component';
import { AccountDashboardComponent } from './pages/dashboard/account-dashboard.component';
import { AccountProfileComponent } from './pages/profile/account-profile.component';
import { ReservationsListComponent } from './pages/reservations/reservations-list.component';
import { ReservationDetailComponent } from './pages/reservations/reservation-detail.component';
import { AccountChangePasswordComponent } from './pages/change-password/account-change-password.component';

export const accountRoutes: Routes = [
  {
    path: '',
    component: AccountShellComponent,
    children: [
      {
        path: '',
        component: AccountDashboardComponent,
      },
      {
        path: 'profile',
        component: AccountProfileComponent,
      },
      {
        path: 'reservations',
        component: ReservationsListComponent,
      },
      {
        path: 'reservations/:id',
        component: ReservationDetailComponent,
      },
      {
        path: 'change-password',
        component: AccountChangePasswordComponent,
      },
    ],
  },
];
