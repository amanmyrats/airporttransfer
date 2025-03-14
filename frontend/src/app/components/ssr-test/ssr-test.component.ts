import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BookingBannerFormComponent } from '../booking-banner-form/booking-banner-form.component';
import { SuperHeaderComponent } from '../super-header/super-header.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-ssr-test',
  imports: [
    CommonModule, 
    BookingBannerFormComponent, 
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
  ],
  templateUrl: './ssr-test.component.html',
  styleUrl: './ssr-test.component.scss'
})
export class SsrTestComponent {
  post: any = {
    title: 'Post Title',
    description: 'Post Description',
    content: 'Post Content', 
    imageUrl: 'https://via.placeholder.com/150'
  };

  faqs: any = [
    {
      question: 'O nasil yapiliyor?',
      answer: 'Boyle yapiliyor', 
      open: false
    }, 

    {
      question: 'Peki digeri nasil yapiliyor?',
      answer: 'Onlar da boyle yapiliyor iste', 
      open: false
    }, 
  ]

}
