import { Component, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { PriceListComponent } from '../../components/price-list/price-list.component';
import { BlogListComponent } from '../../components/blog-list/blog-list.component';
import { CtaComponent } from "../../components/cta/cta.component";
import { TestimonialListComponent } from '../../components/testimonial-list/testimonial-list.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LanguageService } from '../../services/language.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SUPPORTED_MAIN_LOCATIONS } from '../../constants/main-location.constants';

@Component({
  selector: 'app-home',
  imports: [FormsModule, SelectModule, ButtonModule,
    CommonModule,

    SuperHeaderComponent,
    NavbarComponent,
    BannerComponent,
    PriceListComponent,
    CtaComponent, 
    TestimonialListComponent, 
    BlogListComponent, 
    FooterComponent, 
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private router! : Router;
  currentLanguage = {code: 'en', name: 'English', flag: 'flags/gb.svg'};
  mainLocations: any[] = SUPPORTED_MAIN_LOCATIONS;
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any, 
    private route: ActivatedRoute, 
  ) {
    if (typeof window !== 'undefined') {
      this.router = inject(Router);
    }
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  }

}
  