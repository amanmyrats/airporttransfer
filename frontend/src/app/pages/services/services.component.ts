import { Component, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  currentLanguage: any = {
    code: 'en', 
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
}
