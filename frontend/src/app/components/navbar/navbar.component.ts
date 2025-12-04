import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { WhatsappPopupComponent } from '../whatsapp-popup/whatsapp-popup.component';
import { CommonModule } from '@angular/common';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';
import { Language } from '../../models/language.model';

@Component({
  selector: 'app-navbar',
  imports: [
    WhatsappPopupComponent, 
    CommonModule, 
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  navbarMenu: any = NAVBAR_MENU;

  menuOpen = false;
  currentLanguage: Language = { ...SUPPORTED_LANGUAGES[0]! };

  constructor(
    private route: ActivatedRoute, 
  ) { 
  }

  ngOnInit(): void {
    this.currentLanguage = { ...this.resolveLanguageFromRoute() };
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  private resolveLanguageFromRoute(): Language {
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const language = currentRoute.snapshot.data['language'] as string | undefined;
      if (language) {
        const match = SUPPORTED_LANGUAGES.find(({ code }) => code === language);
        if (match) {
          return { ...match };
        }
      }
      currentRoute = currentRoute.parent;
    }
    return { ...SUPPORTED_LANGUAGES[0]! };
  }
}
