import { Routes } from '@angular/router';
import { paymentReadyGuard } from './guards/payment-ready.guard';

export const paymentRoutes: Routes = [
  {
    path: '',
    canActivate: [paymentReadyGuard],
    loadComponent: () => import('./pages/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent),
  },
  {
    path: '3ds-return',
    canActivate: [paymentReadyGuard],
    loadComponent: () => import('./components/three-ds-return/three-ds-return.component').then(m => m.ThreeDsReturnComponent),
  },
];
