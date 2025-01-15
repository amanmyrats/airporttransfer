import { Component, effect, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';

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

  isDropdownVisible = false; // Tracks the visibility of the dropdown menu
  private languageService!: LanguageService;

  constructor() {
    if (typeof window !== 'undefined') {
      this.languageService = inject(LanguageService);

      effect(() => {
        this.selectedLanguage = this.languageService.currentLang();
      });
    }
  }

  ngOnInit(): void {
    console.log('Updating selected language');
    if (typeof window !== 'undefined') {
      this.selectedLanguage = this.languageService.currentLang();
      console.log(this.selectedLanguage);
    }
  }

  /**
   * Handles language selection and closes the dropdown menu
   * @param lang - The selected language object
   */
  onLanguageSelect(lang: any): void {
    this.languageService.setLanguage(lang.code); // Update language via the service
    this.isDropdownVisible = false; // Close the dropdown menu
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