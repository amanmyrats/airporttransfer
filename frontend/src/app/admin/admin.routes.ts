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
import { UserDetailComponent } from './pages/user-detail/user-detail.component';

export const adminRoutes: Routes = [
    {
        path: 'login/',
        component: LoginComponent,
    },
    {
        path: 'logout/',
        component: LogoutComponent,
    },
    {
        path: 'profile/', 
        component: UserDetailComponent,
    },
    {
        path: 'changepassword/',
        component: ChangePasswordComponent,
    },


    {
        path: 'reservations/',
        component: ReservationListComponent,
    },
    {
        path: 'popularroutes/',
        component: PopularRouteListComponent,
    },
    {
        path: 'rates/',
        component: RateListComponent,
    },
    {
        path: 'users/',
        component: UserListComponent,
    }
];
