import { effect, Injectable, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SUPPORTED_LANGUAGES } from '../constants/language.contants';
import { Language } from '../models/language.model';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private languages: Language[] = SUPPORTED_LANGUAGES;
  private storageKey = 'selectedLanguage'; // Key for local storage

  // Signal for the current language
  currentLang = signal<any>(
    this.getStoredLanguage() || SUPPORTED_LANGUAGES.find((lang) => lang.code === 'en')!
  );

  constructor(private route: ActivatedRoute, private router: Router) {
    // effect(() => {
    //   console.log('Triggered currentLang() effect in language service');
    //   console.log('new lang:', this.currentLang());
    //   this.setLanguage(this.currentLang().code);
    // });
  }

  /**
   * Set and navigate to a new language
   * @param langCode - The new language code to set (e.g., 'en', 'tr')
   */
  setLanguage(langCode: string, alreadyNavigated: boolean = false): void {
    const selectedLang = SUPPORTED_LANGUAGES.find((lang) => lang.code === langCode);

    if (selectedLang) {
      // this.currentLang.set(selectedLang); // Update the signal value
      this.storeLanguage(langCode); // Persist the selected language
      console.log('setLanguage was called: ', langCode);
      console.log('alreadyNavigated: ', alreadyNavigated);
      console.log('alreadyNavigated: ', alreadyNavigated);
      console.log('alreadyNavigated: ', alreadyNavigated);
      console.log('alreadyNavigated: ', alreadyNavigated);
      console.log('alreadyNavigated: ', alreadyNavigated);
      if (!alreadyNavigated) {
        console.log('Navigating to new language in language service');
        const currentRoute = this.router.url.split('/').slice(2).join('/'); // Remove language from URL
        console.log('Current route:', currentRoute);
        if (currentRoute) {
          console.log('navigating to ', `${langCode}/${currentRoute}/`);
          this.router.navigate([`${langCode}/${currentRoute}/`]);
        } else {
          console.log('navigating to ', `${langCode}/`);
          this.router.navigate([`${langCode}/`]);
        }
      }
    } else {
      console.warn(`Unsupported language code: ${langCode}`);
    }
  }

  /**
   * Detect the language from the URL and update the signal
   */
  detectLanguage(): void {
    this.route.params.subscribe((params) => {
      const langCode = params['lang'];

      if (langCode) {
        const detectedLang = SUPPORTED_LANGUAGES.find((lang) => lang.code === langCode);

        if (detectedLang) {
          this.currentLang.set(detectedLang); // Update the signal value
          this.storeLanguage(langCode); // Persist the detected language
        } else {
          console.warn(`Unsupported language code detected in URL: ${langCode}`);
          this.router.navigate(['en/']); // Fallback to default language
        }
      }
    });
  }

  /**
   * Get the list of all supported languages.
   * @returns Language[]
   */
  getLanguages(): Language[] {
    return this.languages;
  }

  /**
   * Find a language by its code.
   * @param code The code of the language (e.g., 'en', 'tr').
   * @returns Language | undefined
   */
  getLanguageByCode(code: string): Language | undefined {
    return this.languages.find((language) => language.code === code);
  }

  /**
   * Get the name of a language by its code.
   * @param code The language code.
   * @returns string | undefined
   */
  getLanguageName(code: string): string | undefined {
    const language = this.getLanguageByCode(code);
    return language ? language.name : undefined;
  }

  /**
   * Store the selected language in local storage.
   * @param langCode - The language code to store.
   */
  private storeLanguage(langCode: string): void {
    localStorage.setItem(this.storageKey, langCode);
  }

  /**
   * Retrieve the stored language from local storage.
   * @returns The stored language or undefined.
   */
  private getStoredLanguage(): Language | undefined {
    const langCode = localStorage.getItem(this.storageKey);
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === langCode);
  }
}
