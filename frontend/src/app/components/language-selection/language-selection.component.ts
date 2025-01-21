import { Component, effect, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';
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
  supportedLanguages = SUPPORTED_LANGUAGES;
  selectedLanguage: any = { name: 'English', code: 'en', flag: 'flags/gb.svg' };

  translatedUrlWithoutLang: string = '';

  isDropdownVisible = false; // Tracks the visibility of the dropdown menu
  private languageService!: LanguageService;
  private router!: Router;

  constructor() {
    if (typeof window !== 'undefined') {
      this.languageService = inject(LanguageService);
      this.router = inject(Router);

    //   effect(() => {
    //     this.selectedLanguage = this.languageService.currentLang();
    //     this.translatedUrlWithoutLang = this.getTranslatedUrlWithoutLang(this.selectedLanguage.code);
    // });
    }
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.selectedLanguage = this.languageService.currentLang();
      this.translatedUrlWithoutLang = this.getTranslatedUrlWithoutLang(this.selectedLanguage.code);
    }
  }

  /**
   * Handles language selection and closes the dropdown menu
   * @param lang - The selected language object
   */
  onLanguageSelect(lang: any): void {
    // this.languageService.setLanguage(lang.code, true)
    this.languageService.currentLang.set(lang)
    this.languageService.setLanguage(lang.code, true); // Update the language via service
    this.isDropdownVisible = false; // Close the dropdown
  }

  getTranslatedUrlWithoutLang(langCode: string): string {
    if (typeof window !== 'undefined') {
      const currentUrl = this.router.url; // Get the current URL
      const segments = currentUrl.split('/'); // Split URL into segments
      let isFound: boolean = false;
      if (this.supportedLanguages.map((lang) => lang.code).includes(segments[1])) {
        segments.splice(1, 1);
      }
      for (let i = 0; i < segments.length; i++) {
        for (const key in this.navbarMenu) {
          for (const slugLang in this.navbarMenu[key].slug) {
            if (encodeURIComponent(this.navbarMenu[key].slug[slugLang]) === segments[i]) {
              segments[i] = this.navbarMenu[key].slug[langCode];
              break;
            }
          }
        }
        if (isFound) {
          break;
        }
      }
      return segments.join('/'); // Reconstruct the URL
    }
    return '/';
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
}