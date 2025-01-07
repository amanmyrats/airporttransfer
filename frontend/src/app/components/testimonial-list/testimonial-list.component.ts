import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-testimonial-list',
  imports: [
    CarouselModule
    ,
  ],
  templateUrl: './testimonial-list.component.html',
  styleUrl: './testimonial-list.component.scss'
})
export class TestimonialListComponent {

  testimonials = [
    {
      text: 'This was the smoothest airport transfer experience I’ve ever had. Highly recommend this service for stress-free travel!',
      author: 'Anna K., Germany',
    },
    {
      text: 'Traveling with kids can be challenging, but this service made everything so easy! Definitely our go-to service for Turkey.',
      author: 'Emily R., United Kingdom',
    },
    {
      text: 'We booked a Mercedes Vito for our airport transfer in Istanbul, and it felt like a VIP experience! Highly professional.',
      author: 'Alexander S., Russia',
    },
  ];

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1,
    },
  ];
}