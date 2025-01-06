import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { ServicesComponent } from './pages/services/services.component';
import { BlogComponent } from './pages/blog/blog.component';
import { PricesComponent } from './pages/prices/prices.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    { path: ':lang', component: HomeComponent }, // Set HomeComponent for root

    { path: ':lang/home', component: HomeComponent },
    {
        path: ':lang/aboutus',component: AboutUsComponent,
    },
    {
        path: ':lang/contactus',component: ContactUsComponent,
    },
    {
        path: ':lang/services',component: ServicesComponent,
    },
    {
        path: ':lang/blog', component: BlogComponent,
    },
    {
        path: ':lang/prices',component: PricesComponent,
    },
    { path: '**', redirectTo: 'en/home' }, // Redirect unknown paths
];
