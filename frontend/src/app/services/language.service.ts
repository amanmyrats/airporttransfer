import { Injectable, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SUPPORTED_LANGUAGES } from '../constants/language.contants';

@Injectable({
  providedIn: 'root'
})
export class LanguageService  {
  // Use a signal for the current language
  currentLang = signal<{}>(
    SUPPORTED_LANGUAGES.find(lang => lang.code === 'en')!

  );

  constructor(private route: ActivatedRoute, private router: Router) {}

  /**
   * Set and navigate to a new language
   * @param langCode - The new language code to set (e.g., 'en', 'tr')
   */
  setLanguage(langCode: string): void {
    const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);

    if (selectedLang) {
      this.currentLang.set(selectedLang); // Update the signal value
      const currentRoute = this.router.url.split('/').slice(2).join('/'); // Remove language from URL
      this.router.navigate([`/${langCode}/${currentRoute}`]);
    } else {
      console.warn(`Unsupported language code: ${langCode}`);
    }
  }

  /**
   * Detect the language from the URL and update the signal
   */
  detectLanguage(): void {
    console.log('Calling detectLanguage in LanguageService');
    this.route.params.subscribe(params => {
      const langCode = params['lang'];
      console.log('langCode:', langCode);

      if (langCode) {
        const detectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);

        if (detectedLang) {
          this.currentLang.set(detectedLang); // Update the signal value
          console.log('Detected language:', detectedLang);
        } else {
          console.warn(`Unsupported language code detected in URL: ${langCode}`);
          // Optionally redirect to a default language
          this.router.navigate(['/en']);
        }
      }
    });
  }
  
}