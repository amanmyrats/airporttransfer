import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { ServicesComponent } from './pages/services/services.component';
import { BlogComponent } from './pages/blog/blog.component';
import { PricesComponent } from './pages/prices/prices.component';
import { AppComponent } from './app.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminHomeComponent } from './admin/pages/admin-home/admin-home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Set HomeComponent for root

    { path: ':lang/home', component: HomeComponent },
    {
        path: ':lang/prices',component: PricesComponent,
    },
    {
        path: ':lang/reservation',component: ReservationComponent,
    },
    {
        path: ':lang/aboutus',component: AboutUsComponent,
    },
    {
        path: ':lang/services',component: ServicesComponent,
    },
    {
        path: ':lang/gallery',component: GalleryComponent,
    },
    {
        path: ':lang/contact',component: ContactUsComponent,
    },
    {
        path: ':lang/blog', component: BlogComponent,
    },
    {
        path: 'admin',
        // canActivate: [AuthGuard],
        // canActivateChild: [AuthGuard],
        component: AdminHomeComponent, 
        loadChildren: () => import('./admin/admin.routes').then(x => x.adminRoutes),
        data: { noHydration: true },
    },


    { path: '**', redirectTo: 'en/home' }, // Redirect unknown paths
];
