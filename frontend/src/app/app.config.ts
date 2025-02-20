import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { jwtInterceptor } from './interceptors/jwt.interceptor';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideGoogleTagManager } from 'angular-google-tag-manager';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      routes,
      withInMemoryScrolling({ 
        anchorScrolling: 'enabled', 
        scrollPositionRestoration: 'enabled' })
      ), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(),withInterceptors([jwtInterceptor])), 
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura
        }
    }), 
    provideGoogleTagManager({ id: 'GTM-WMWVRLJ4' }),

  ]
};
