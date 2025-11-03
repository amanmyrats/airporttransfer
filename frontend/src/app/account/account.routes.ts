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
        path: 'reviews',
        loadComponent: () => import('./pages/reviews/my-reviews.component').then(m => m.MyReviewsComponent),
      },
      {
        path: 'reviews/new/:reservationId',
        loadComponent: () => import('./pages/reviews/review-create.component').then(m => m.ReviewCreateComponent),
      },
      {
        path: 'reviews/:id',
        loadComponent: () => import('./pages/reviews/review-detail.component').then(m => m.ReviewDetailComponent),
      },
      {
        path: 'change-password',
        component: AccountChangePasswordComponent,
      },
    ],
  },
];
