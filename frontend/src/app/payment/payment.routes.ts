import { Routes } from '@angular/router';

import { paymentReadyGuard } from './guards/payment-ready.guard';
import { browserOnlyGuard } from './guards/browser-only.guard';
import { threeDsHandlerProviders } from './services/three-ds.providers';

export const paymentRoutes: Routes = [
  {
    path: '',
    canActivate: [paymentReadyGuard],
    providers: [...threeDsHandlerProviders],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent),
      },
      {
        path: 'three-ds-return',
        canActivate: [browserOnlyGuard],
        loadComponent: () =>
          import('./components/three-ds-return/three-ds-return.component').then(m => m.ThreeDsReturnComponent),
      },
      {
        path: 'result',
        loadComponent: () =>
          import('./pages/checkout-result/checkout-result.component').then(m => m.CheckoutResultComponent),
      },
    ],
  },
];
