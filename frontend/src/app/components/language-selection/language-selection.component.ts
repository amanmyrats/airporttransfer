import { Component, effect, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-language-selection',
  imports: [
    CommonModule, 
  ],
  templateUrl: './language-selection.component.html',
  styleUrl: './language-selection.component.scss'
})
export class LanguageSelectionComponent {
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

      effect(() => {
        this.selectedLanguage = this.languageService.currentLang();
        this.translatedUrlWithoutLang = this.getTranslatedUrlWithoutLang(this.selectedLanguage.code);
    });
    }
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      console.log('Updating selected language in language selection component, no redirection');
      this.selectedLanguage = this.languageService.currentLang();
      this.translatedUrlWithoutLang = this.getTranslatedUrlWithoutLang(this.selectedLanguage.code);
      console.log(this.selectedLanguage);
    }
  }

  /**
   * Handles language selection and closes the dropdown menu
   * @param lang - The selected language object
   */
  onLanguageSelect(lang: any): void {
    console.log('onLanguageSelect Selected language in language selection component:', lang);
    this.languageService.setLanguage(lang.code, true)
    this.isDropdownVisible = false; // Close the dropdown
  }

  getTranslatedUrlWithoutLang(langCode: string): string {
    const currentUrl = this.router.url; // Get the current URL
    const segments = currentUrl.split('/'); // Split URL into segments
    // segments[1] = langCode; // Replace the language code segment
    // if segments[1] is in the supported languages then remove it
    if (this.supportedLanguages.map((lang) => lang.code).includes(segments[1])) {
      segments.splice(1, 1);
    }
    return segments.join('/'); // Reconstruct the URL
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