import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { ServicesComponent } from './pages/services/services.component';
import { BlogComponent } from './pages/blog/blog.component';
import { PricesComponent } from './pages/prices/prices.component';

export const routes: Routes = [
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
    // {
    //   path: 'aboutus',
    //   component: 
    //     import('./pages/about-us/about-us.component').then((m) => m.AboutUsComponent),
    // },
    // {
    //     path: 'contactus',
    //     component: 
    //         import('./pages/contact-us/contact-us.component').then((m) => m.ContactUsComponent),
    // },
    // {
    //     path: 'services',
    //     component: 
    //         import('./pages/services/services.component').then((m) => m.ServicesComponent),
    // },
    // {
    //     path: 'blog', 
    //     component: 
    //         import('./pages/blog/blog.component').then((m) => m.BlogComponent),
    // },
    // {
    //     path: 'prices',
    //     component: 
    //         import('./pages/prices/prices.component').then((m) => m.PricesComponent),
    // },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home' }, // Redirect unknown paths
];
