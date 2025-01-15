/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LanguageService } from './app/services/language.service';
import { CurrencyService } from './app/services/currency.service';

bootstrapApplication(AppComponent, appConfig)
    .then(appRef => {
        // You can call any service method here
    })
    .catch(err => console.error(err));