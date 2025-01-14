import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';
import { PasswordResetConfirmComponent } from './pages/password-reset-confirm/password-reset-confirm.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { PopularRouteListComponent } from './pages/popular-route-list/popular-route-list.component';
import { RateListComponent } from './pages/rate-list/rate-list.component';
import { ReservationListComponent } from './pages/reservation-list/reservation-list.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { UserProfileFormComponent } from './pages/user-profile-form/user-profile-form.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';

export const adminRoutes: Routes = [
    // {
    //     path: '',
    //     // loadComponent: () =>
    //     //     import('./pages/login/login.component').then((c) => c.LoginComponent),
    //     component: AdminHomeComponent,
    // },
    {
        path: 'login',
        // loadComponent: () =>
        //     import('./pages/login/login.component').then((c) => c.LoginComponent),
        component: LoginComponent,
    },
    {
        path: 'logout',
        // loadComponent: () =>
        //     import('./pages/logout/logout.component').then((c) => c.LogoutComponent),
        component: LogoutComponent,
    },
    {
        path: 'profile', 
        component: UserDetailComponent,
    },
    {
        path: 'changepassword',
        // loadComponent: () =>
        //     import('./pages/change-password/change-password.component').then((c) => c.ChangePasswordComponent),
        component: ChangePasswordComponent,
    },
    {
        path: 'passwordreset',
        // loadComponent: () =>
        //     import('./pages/password-reset/password-reset.component').then((c) => c.PasswordResetComponent),
        component: PasswordResetComponent,
    },
    {
        path: 'passwordresetconfirm',
        // loadComponent: () =>
        //     import('./pages/password-reset-confirm/password-reset-confirm.component').then((c) => c.PasswordResetConfirmComponent),
        component: PasswordResetConfirmComponent,
    },
    {
        path: 'unauthorized',
        // loadComponent: () =>
        //     import('./pages/unauthorized/unauthorized.component').then((c) => c.UnauthorizedComponent),
        component: UnauthorizedComponent,
    },
    {
        path: 'popularroutes',
        // loadComponent: () =>
        //     import('./pages/popular-route-list/popular-route-list.component').then((c) => c.PopularRouteListComponent),
        component: PopularRouteListComponent,
    },
    {
        path: 'rates',
        // loadComponent: () =>
        //     import('./pages/rate-list/rate-list.component').then((c) => c.RateListComponent),
        component: RateListComponent,
    },
    {
        path: 'reservations',
        // loadComponent: () =>
        //     import('./pages/reservation-list/reservation-list.component').then((c) => c.ReservationListComponent),
        component: ReservationListComponent,
    },
    {
        path: 'users',
        // loadComponent: () =>
        //     import('./pages/user-list/user-list.component').then((c) => c.UserListComponent),
        component: UserListComponent,
    }
];
