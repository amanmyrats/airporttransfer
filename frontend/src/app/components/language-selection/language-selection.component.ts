import { afterNextRender, afterRender, ChangeDetectorRef, Component, effect, Inject, inject, Input, PLATFORM_ID } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';
import { ActivatedRoute, Route, Router } from '@angular/router';
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
  @Input() langInput: any | null = null; // Input property for language selection
  selectedLanguage: any = { name: 'English', code: 'en', flag: 'flags/gb.svg' };

  translatedUrlWithoutLang: string = '';

  isDropdownVisible = false; // Tracks the visibility of the dropdown menu
  private languageService!: LanguageService;
  private router!: Router;

  constructor(
    private route: ActivatedRoute, 
    @Inject(PLATFORM_ID) private platformId: any,
    private cd: ChangeDetectorRef,
  ) {
    
    if (typeof window !== 'undefined') {
      this.languageService = inject(LanguageService);
      this.router = inject(Router);

      //   effect(() => {
      //     this.selectedLanguage = this.languageService.currentLang();
      //     this.translatedUrlWithoutLang = this.getTranslatedUrlWithoutLang(this.selectedLanguage.code);
      // });
    }
    afterNextRender(() => {
      console.log('afterRender in language selection');
      console.log(this.route.snapshot);
      const lang = this.languageService.detectLanguageFromRoute(this.route);
      if (lang) {
        if (lang.code !== this.selectedLanguage.code) {
          this.selectedLanguage = lang;
          this.onLanguageSelect(lang);
          this.cd.detectChanges(); // 👈 Fixes the error
        }
      }
    });
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
    // this.languageService.currentLang.set(lang)
    this.languageService.setLanguage(lang.code, true); // Update the language via service
    this.isDropdownVisible = false; // Close the dropdown
  }

  getTranslatedUrlWithoutLang(langCode: string): string {
    if (typeof window !== 'undefined') {
      const currentUrl = this.router.url; // Get the current URL
      const segments = currentUrl.split('/'); // Split URL into segments
      let queryParam = '';
      let isFound: boolean = false;
      // console.log('segments[1]: ', segments[1]);
      if (this.supportedLanguages.map((lang) => lang.code).includes(segments[1])) {
        segments.splice(1, 1);
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
}