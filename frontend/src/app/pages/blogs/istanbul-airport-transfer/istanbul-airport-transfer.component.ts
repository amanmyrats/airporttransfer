import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { NAVBAR_MENU } from '../../../constants/navbar-menu.constants';

@Component({
  selector: 'app-istanbul-airport-transfer',
    imports: [
      SuperHeaderComponent, 
      NavbarComponent, 
      FooterComponent, 
    ],
  templateUrl: './istanbul-airport-transfer.component.html',
  styleUrl: './istanbul-airport-transfer.component.scss'
})
export class IstanbulAirportTransferComponent  {
  navBarMenu: any = NAVBAR_MENU;
  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };
  
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log('inside istanbul sabiha gokcen blog')
    console.log(this.route.snapshot)
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  }

}