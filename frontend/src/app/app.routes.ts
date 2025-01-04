import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { ServicesComponent } from './pages/services/services.component';
import { BlogComponent } from './pages/blog/blog.component';
import { PricesComponent } from './pages/prices/prices.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Set HomeComponent for root

    { path: 'home', component: HomeComponent },
    {
        path: 'aboutus',component: AboutUsComponent,
    },
    {
        path: 'contactus',component: ContactUsComponent,
    },
    {
        path: 'services',component: ServicesComponent,
    },
    {
        path: 'blog', component: BlogComponent,
    },
    {
          path: 'prices',component: PricesComponent,
    },
    { path: '**', redirectTo: 'home' }, // Redirect unknown paths
];
