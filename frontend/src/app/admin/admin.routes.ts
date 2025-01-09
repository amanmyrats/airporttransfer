import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login.component').then((c) => c.LoginComponent),
    },
    {
        path: 'logout',
        loadComponent: () =>
            import('./pages/logout/logout.component').then((c) => c.LogoutComponent),
    },
    {
        path: 'changepassword',
        loadComponent: () =>
            import('./pages/change-password/change-password.component').then((c) => c.ChangePasswordComponent),
    },
    {
        path: 'passwordreset',
        loadComponent: () =>
            import('./pages/password-reset/password-reset.component').then((c) => c.PasswordResetComponent),
    },
    {
        path: 'passwordresetconfirm',
        loadComponent: () =>
            import('./pages/password-reset-confirm/password-reset-confirm.component').then((c) => c.PasswordResetConfirmComponent),
    },
    {
        path: 'unauthorized',
        loadComponent: () =>
            import('./pages/unauthorized/unauthorized.component').then((c) => c.UnauthorizedComponent),
    },
    {
        path: 'cartypes',
        loadComponent: () =>
            import('./pages/car-type-list/car-type-list.component').then((c) => c.CarTypeListComponent),
    },
    {
        path: 'mainlocations',
        loadComponent: () =>
            import('./pages/main-location-list/main-location-list.component').then((c) => c.MainLocationListComponent),
    },
    {
        path: 'popularroutes',
        loadComponent: () =>
            import('./pages/popular-route-list/popular-route-list.component').then((c) => c.PopularRouteListComponent),
    },
    {
        path: 'rates',
        loadComponent: () =>
            import('./pages/rate-list/rate-list.component').then((c) => c.RateListComponent),
    },
    {
        path: 'reservations',
        loadComponent: () =>
            import('./pages/reservation-list/reservation-list.component').then((c) => c.ReservationListComponent),
    },
    {
        path: 'users',
        loadComponent: () =>
            import('./pages/user-list/user-list.component').then((c) => c.UserListComponent),
    }
];
