import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SUPPORTED_LANGUAGES } from '../constants/language.contants';
import { Language } from '../models/language.model';
import { isPlatformBrowser } from '@angular/common';

export type SupportedLangCode = 'en' | 'de' | 'ru' | 'tr';
const SUPPORTED_LANG_CODES: readonly SupportedLangCode[] = ['en', 'de', 'ru', 'tr'] as const;

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private languages: Language[] = SUPPORTED_LANGUAGES;
  private storageKey = 'selectedLanguage'; // Key for local storage

  // Signal for the current language
  currentLang = signal<any>(
    this.getStoredLanguage() || 
    // this.detectLanguageFromRoute() || 
    SUPPORTED_LANGUAGES.find((lang) => lang.code === 'en')!
  );

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object, 
  ) {
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
      // console.log('setLanguage was called: ', langCode);
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

  detectLanguageFromRoute(route: any): Language | undefined {
    // console.log(route.snapshot)
    // console.log(route.snapshot.url)
    const firstSegment = route.snapshot.url[0]?.path; // Get first part of the URL
    // console.log('detectLanguageFromRoute was called: ', firstSegment);
    // console.log('returning: ', SUPPORTED_LANGUAGES.find((lang) => lang.code === firstSegment));
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === firstSegment);
  }

  /**
   * Detect the language from the URL and update the signal
   */
  detectLanguage(): void {
    this.route.params.subscribe((params) => {
      const langCode = params['lang'];
      console.log(params);
      console.log('detectLanguage was called: ', langCode);
      if (langCode) {
        const detectedLang = SUPPORTED_LANGUAGES.find((lang) => lang.code === langCode);
        console.log('detectedLang: ', detectedLang)
        if (detectedLang) {
          this.currentLang.set(detectedLang); // Update the signal value
          this.storeLanguage(langCode); // Persist the detected language
          // if different than currentLang signal then assig
          // if (this.currentLang().code !== detectedLang.code) {
          //   this.currentLang.set(detectedLang);
          // }
          
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

  extractLangFromUrl(url: string): SupportedLangCode | null {
    if (!url) {
      return null;
    }
    const clean = url.split('?')[0];
    const segment = clean.split('/').filter(Boolean)[0];
    return SUPPORTED_LANG_CODES.includes(segment as SupportedLangCode)
      ? (segment as SupportedLangCode)
      : null;
  }

  withLangPrefix(path: string, lang?: string | null): string {
    const normalized = path.replace(/^\/+/, '');
    if (lang && SUPPORTED_LANG_CODES.includes(lang as SupportedLangCode)) {
      return `/${lang}/${normalized}`.replace(/\/+/g, '/');
    }
    return `/${normalized}`.replace(/\/+/g, '/');
  }

  commandsWithLang(lang: string | null, ...segments: string[]): any[] {
    const normalized = segments.map(segment =>
      segment.replace(/^\/+/g, '').replace(/\/+$/g, ''),
    );
    if (lang && SUPPORTED_LANG_CODES.includes(lang as SupportedLangCode)) {
      return ['/', lang, ...normalized];
    }
    return ['/', ...normalized];
  }

  /**
   * Store the selected language in local storage.
   * @param langCode - The language code to store.
   */
  private storeLanguage(langCode: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, langCode);
      console.log('Stored lang: ', langCode)
    }
  }

  /**
   * Retrieve the stored language from local storage.
   * @returns The stored language or undefined.
   */
  private getStoredLanguage(): Language | undefined {
    if (isPlatformBrowser(this.platformId)) {
      const langCode = localStorage.getItem(this.storageKey);
      return SUPPORTED_LANGUAGES.find((lang) => lang.code === langCode);
    }
    return undefined; // Avoid accessing signal here during SSR
  }    

}
