import { Routes } from '@angular/router';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { PopularRouteListComponent } from './pages/popular-route-list/popular-route-list.component';
import { RateListComponent } from './pages/rate-list/rate-list.component';
import { ReservationListComponent } from './pages/reservation-list/reservation-list.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { BlogPostListComponent } from './blogs/components/blog-post-list/blog-post-list.component';
import { BlogPostFormComponent } from './blogs/components/blog-post-form/blog-post-form.component';
import { BlogCategoryListComponent } from './blogs/components/blog-category-list/blog-category-list.component';
import { BlogTagListComponent } from './blogs/components/blog-tag-list/blog-tag-list.component';
import { BlogPostSectionListComponent } from './blogs/components/blog-post-section-list/blog-post-section-list.component';
import { BlogPostDetailComponent } from './blogs/components/blog-post-detail/blog-post-detail.component';
import { BlogPostPreviewComponent } from './blogs/components/blog-post-preview/blog-post-preview.component';
import { FaqLibraryListComponent } from './blogs/components/faq-library-list/faq-library-list.component';

export const adminRoutes: Routes = [
    {
        path: 'login',
        pathMatch: 'full',
        redirectTo: '',
    },
    {
        path: 'logout',
        loadComponent: () => import('../auth/pages/logout/logout.component').then(m => m.LogoutComponent),
    },
    {
        path: 'profile', 
        component: UserDetailComponent,
    },
    {
        path: 'changepassword',
        loadComponent: () => import('../auth/pages/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    },


    {
        path: 'reservations',
        component: ReservationListComponent,
    },
    {
        path: 'popularroutes',
        component: PopularRouteListComponent,
    },
    {
        path: 'rates',
        component: RateListComponent,
    },
    {
        path: 'users',
        component: UserListComponent,
    },
    {
        path: 'blog-posts',
        component: BlogPostListComponent,
    },
    {
        path: 'blog-posts/new',
        component: BlogPostFormComponent,
    },
    {
        path: 'blog-posts/categories',
        component: BlogCategoryListComponent,
    },
    {
        path: 'blog-posts/tags',
        component: BlogTagListComponent,
    },
    {
        path: 'blog-posts/:id',
        component: BlogPostDetailComponent,
    },
    {
        path: 'blog-posts/:id/preview',
        component: BlogPostPreviewComponent,
    },
    {
        path: 'blog-posts/:id/edit',
        component: BlogPostFormComponent,
    },
    {
        path: 'blog-posts/:id/sections',
        component: BlogPostSectionListComponent, 
    }, 
    {
        path: 'faqlibraries',
        component: FaqLibraryListComponent, 
    }, 
];
