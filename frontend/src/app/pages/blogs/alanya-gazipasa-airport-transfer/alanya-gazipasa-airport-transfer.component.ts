import { Component } from '@angular/core';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { NAVBAR_MENU } from '../../../constants/navbar-menu.constants';

@Component({
  selector: 'app-alanya-gazipasa-airport-transfer',
    imports: [
      SuperHeaderComponent, 
      NavbarComponent, 
      FooterComponent, 
    ],
  templateUrl: './alanya-gazipasa-airport-transfer.component.html',
  styleUrl: './alanya-gazipasa-airport-transfer.component.scss'
})
export class AlanyaGazipasaAirportTransferComponent {
  navbarMenu: any = NAVBAR_MENU;

  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };
  
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  }

}
