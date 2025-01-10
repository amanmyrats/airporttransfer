/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LanguageService } from './app/services/language.service';
import { CurrencyService } from './app/services/currency.service';

bootstrapApplication(AppComponent, appConfig)
    .then(appRef => {
        // Inject the LanguageService to handle language detection
        const languageService = appRef.injector.get(LanguageService);
        const currencyService = appRef.injector.get(CurrencyService);

        // Detect the current language from the URL and initialize it
        console.log("calling detect language in main.ts")
        // languageService.detectLanguage();
        // currencyService.detectCurrency();
    })
    .catch(err => console.error(err));