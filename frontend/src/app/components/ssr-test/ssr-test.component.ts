import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BookingInitialFormComponent } from '../booking-initial-form/booking-initial-form.component';
import { BookingBannerFormComponent } from '../booking-banner-form/booking-banner-form.component';

@Component({
  selector: 'app-ssr-test',
  imports: [
    CommonModule, 
    BookingBannerFormComponent, 
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
