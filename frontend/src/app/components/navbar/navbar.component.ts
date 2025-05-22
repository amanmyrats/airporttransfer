import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { WhatsappPopupComponent } from '../whatsapp-popup/whatsapp-popup.component';

@Component({
  selector: 'app-navbar',
  imports: [
    WhatsappPopupComponent, 
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
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
