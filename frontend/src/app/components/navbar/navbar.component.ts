import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { WhatsappPopupComponent } from '../whatsapp-popup/whatsapp-popup.component';
import { CommonModule } from '@angular/common';

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
  currentLanguage = {  code: 'en', 
                    name: 'English', 
                    flag: 'flags/gb.svg', 
                  };

  constructor(
    private route: ActivatedRoute, 
  ) { 
  }

  ngOnInit(): void {
    this.currentLanguage.code = this.resolveLanguageFromRoute();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  private resolveLanguageFromRoute(): string {
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const language = currentRoute.snapshot.data['language'];
      if (language) {
        return language;
      }
      currentRoute = currentRoute.parent;
    }
    return 'en';
  }
}
