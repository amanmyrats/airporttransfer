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
import { BlogPostListComponent } from '../blog/components/blog-post-list/blog-post-list.component';
import { BlogPostFormComponent } from '../blog/components/blog-post-form/blog-post-form.component';
import { BlogCategoryListComponent } from '../blog/components/blog-category-list/blog-category-list.component';
import { BlogTagListComponent } from '../blog/components/blog-tag-list/blog-tag-list.component';
import { BlogPostSectionListComponent } from '../blog/components/blog-post-section-list/blog-post-section-list.component';
import { BlogPostDetailComponent } from '../blog/components/blog-post-detail/blog-post-detail.component';
import { BlogPostPreviewComponent } from '../blog/components/blog-post-preview/blog-post-preview.component';
import { FaqLibraryListComponent } from '../blog/components/faq-library-list/faq-library-list.component';

export const adminRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'logout',
        component: LogoutComponent,
    },
    {
        path: 'profile', 
        component: UserDetailComponent,
    },
    {
        path: 'changepassword',
        component: ChangePasswordComponent,
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
