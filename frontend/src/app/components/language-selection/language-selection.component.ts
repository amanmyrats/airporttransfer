import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Language } from '../../models/language.model';
import {
  LanguageCode,
  SupportedLanguage,
  SUPPORTED_LANGUAGE_CODES,
  SUPPORTED_LANGUAGES,
} from '../../constants/language.contants';
import { Router } from '@angular/router';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';

@Component({
  selector: 'app-language-selection',
  imports: [
    CommonModule, 
  ],
  templateUrl: './language-selection.component.html',
  styleUrl: './language-selection.component.scss'
})
export class LanguageSelectionComponent {
  navbarMenu: any = NAVBAR_MENU;
  supportedLanguages: SupportedLanguage[] = SUPPORTED_LANGUAGES.map((lang) => ({ ...lang }));
  @Input() langInput: Language | null = null; // Input property for language selection
  @Input() trailingMultilingualBlogSlug: Partial<Record<LanguageCode, string>> | null = null; // e.g., 'blogs/turkey-airport-transfer-blogs/multilingual-slug'
  selectedLanguage: Language = { ...SUPPORTED_LANGUAGES[0]! };

  translatedUrlWithoutLang: string = '';

  isDropdownVisible = false; // Tracks the visibility of the dropdown menu
  constructor(
    private languageService: LanguageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.selectedLanguage = this.languageService.currentLang();
      this.translatedUrlWithoutLang = this.getTranslatedUrlWithoutLang(this.selectedLanguage.code);
    }
  }

  /**
   * Handles language selection and closes the dropdown menu
   * @param lang - The selected language object
   */
  onLanguageSelect(lang: SupportedLanguage): void {
    // this.languageService.setLanguage(lang.code, true)
    // this.languageService.currentLang.set(lang)
    this.languageService.setLanguage(lang.code, true); // Update the language via service
    this.isDropdownVisible = false; // Close the dropdown
  }

  getTranslatedUrlWithoutLang(langCode: LanguageCode): string {
    if (isPlatformBrowser(this.platformId)) {
      const currentUrl = this.router.url; // Get the current URL
      // ex: http://localhost:4200/en/turkey-airport-transfer-blogs/test-2
      const segments = currentUrl.split('/'); // Split URL into segments
      // ex: ["", "en", "turkey-airport-transfer-blogs", "test-2"]
      const candidate = segments[1] as LanguageCode | undefined;
      if (candidate && SUPPORTED_LANGUAGE_CODES.includes(candidate)) {
        segments.splice(1, 1);
        // ex: segments after splice:  ["", "turkey-airport-transfer-blogs", "test-2"]

        // split with ?
        // if (segments[segments.length - 1].includes('?')) {
        //   queryParam = segments[segments.length - 1].split('?')[1];
        //   segments[segments.length - 1] = segments[segments.length - 1].split('?')[0];
        // }
        // console.log('segments after splice: ', segments);
      }
      for (let i = 0; i < segments.length; i++) {
        for (const key in this.navbarMenu) {
          // console.log('key: ', key)
          for (const slugLang in this.navbarMenu[key].slug) {
            // console.log('slugLang: ', slugLang)
            if (encodeURIComponent(this.navbarMenu[key].slug[slugLang]) === segments[i]) {
              segments[i] = this.navbarMenu[key].slug[langCode];
              // ex: segments[i] = "turkish-airport-transfer-blogs"
              break;
            }
          }
        }
      }
      if (this.trailingMultilingualBlogSlug) {
        const fallbackLangCode = SUPPORTED_LANGUAGES[0]!.code;
        const slug =
          this.trailingMultilingualBlogSlug[langCode] ??
          this.trailingMultilingualBlogSlug[fallbackLangCode] ??
          segments[segments.length - 1];
        segments[segments.length - 1] = slug;
      }

      return segments.join('/'); // Reconstruct the URL
      // segments = ["", "turkish-airport-transfer-blogs", "test-2"]
      // return "/turkish-airport-transfer-blogs/test-2"
    }
    return '';
  }

  /**
   * Toggles the visibility of the dropdown menu
   */
  toggleDropdown(): void {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  /**
   * Closes the dropdown menu when the mouse leaves the dropdown area
   */
  closeDropdown(): void {
    this.isDropdownVisible = false;
  }

  protected trackByLang = (_: number, lang: SupportedLanguage) => lang.code;

  protected buildLanguageHref(code: LanguageCode): string {
    const path = this.getTranslatedUrlWithoutLang(code);
    const combined = `/${code}${path}`.replace(/\/+/g, '/');
    return combined.endsWith('/') ? combined : `${combined}/`;
  }
}
