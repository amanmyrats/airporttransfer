import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { PriceListComponent } from '../../components/price-list/price-list.component';
import { BlogListComponent } from '../../components/blog-list/blog-list.component';
import { CtaComponent } from "../../components/cta/cta.component";
import { TestimonialListComponent } from '../../components/testimonial-list/testimonial-list.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [FormsModule, SelectModule, ButtonModule,
    CommonModule,
    SuperHeaderComponent,
    NavbarComponent,
    BannerComponent,
    PriceListComponent,
    BlogListComponent, CtaComponent, 
    TestimonialListComponent, 
    FooterComponent, 
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor() {
  }

  ngOnInit(): void {
    console.log('HomeComponent');
  }

}
