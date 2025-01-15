import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { ServicesComponent } from './pages/services/services.component';
import { BlogComponent } from './pages/blog/blog.component';
import { PricesComponent } from './pages/prices/prices.component';
import { AppComponent } from './app.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminHomeComponent } from './admin/pages/admin-home/admin-home.component';
import { BookingComponent } from './pages/booking/booking.component';
import { BookingReceivedComponent } from './pages/booking-received/booking-received.component';
import { PasswordResetComponent } from './admin/pages/password-reset/password-reset.component';
import { PasswordResetConfirmComponent } from './admin/pages/password-reset-confirm/password-reset-confirm.component';
import { UnauthorizedComponent } from './admin/pages/unauthorized/unauthorized.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Set HomeComponent for root

    { path: 'en/home', component: HomeComponent },
    {
        path: ':lang/prices',component: PricesComponent,
    },
    {
        path: ':lang/booking',component: BookingComponent,
    },
    {
        path: ':lang/booking/received',component: BookingReceivedComponent,
    },
    {
        path: 'en/aboutus',component: AboutUsComponent,
    },
    {
        path: 'en/services',component: ServicesComponent,
    },
    {
        path: 'en/gallery',component: GalleryComponent,
    },
    {
        path: 'en/contact',component: ContactUsComponent,
    },
    {
        path: 'en/blog', component: BlogComponent,
    },
    {
        path: 'admin',
        // canActivate: [AuthGuard],
        // canActivateChild: [AuthGuard],
        component: AdminHomeComponent, 
        loadChildren: () => import('./admin/admin.routes').then(x => x.adminRoutes),
        data: { noHydration: true },
    },

    {
        path: 'passwordreset',
        component: PasswordResetComponent,
    },
    {
        path: 'passwordresetconfirm',
        component: PasswordResetConfirmComponent,
    },
    {
        path: 'unauthorized',
        component: UnauthorizedComponent,
    },

    {
        path: 'en',component: HomeComponent,
    },


    { path: '**', redirectTo: 'en/home' }, // Redirect unknown paths
];
