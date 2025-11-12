import { Routes } from '@angular/router';

export const paymentAdminRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'intents',
      },
      {
        path: 'offline-settlement',
        loadComponent: () =>
          import('./pages/offline-settlement/offline-settlement.component').then(
            m => m.OfflineSettlementComponent,
          ),
      },
      {
        path: 'refund-issue',
        loadComponent: () =>
          import('./pages/refund-issue/refund-issue.component').then(
            m => m.RefundIssueComponent,
          ),
      },
      {
        path: 'intents',
        loadComponent: () =>
          import('./pages/payment-intents/payment-intents.component').then(
            m => m.PaymentIntentsComponent,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./pages/payment-transactions/payment-transactions.component').then(
            m => m.PaymentTransactionsComponent,
          ),
      },
    ],
  },
];
