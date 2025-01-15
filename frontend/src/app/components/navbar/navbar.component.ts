import { Component, effect, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private languageService!: LanguageService;
  private router!: Router;

  menuOpen = false;
  selectedLang = {  code: 'en', 
                    name: 'English', 
                    flag: 'flags/gb.svg', 
                    url: '/en/home' 
                  };

  constructor(
  ) { 
    if (typeof window !== 'undefined') {
      this.languageService = inject(LanguageService);
      this.router = inject(Router);

      effect(() => {
        this.selectedLang = this.languageService.currentLang();
      }
      );
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
  
}
