import { Component } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  menuOpen = false;

  constructor(
    public languageService: LanguageService,
  ) { }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

}
