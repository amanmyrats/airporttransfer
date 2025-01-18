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

  testimonials: any[] = [
    {
      text: 'Booking our airport transfer from Antalya Airport to our hotel in Alanya was a breeze. The driver was punctual, professional, and made the ride so comfortable. I\'ll definitely use this service again for stress-free transfers in Turkey!',
      author: 'Sarah J., United Kingdom',
    },
    {
      text: 'I needed a transfer from Istanbul Airport to Taksim late at night, and the service exceeded my expectations. The car was spotless, the driver was courteous, and everything felt premium. Highly recommend this company for Istanbul airport transfers!',
      author: 'David L., United States',
    },
    {
      text: 'Der Flughafentransfer vom Flughafen Antalya nach Side war einfach perfekt. Der Fahrer war freundlich, das Auto komfortabel, und wir haben den Strandurlaub stressfrei gestartet. Ich kann diesen Service nur empfehlen!',
      author: 'Lisa M., Deutschland',
    },
    {
      text: 'Unser Transfer vom Flughafen Bodrum Milas nach Bodrum Zentrum verlief reibungslos. Es war ein sehr professioneller und bequemer Service, genau das, was man nach einem langen Flug braucht. Vielen Dank!',
      author: 'Markus W., Deutschland',
    },
    {
      text: 'Заказывали трансфер из аэропорта Сабиха Гёкчен в район Султанахмет. Машина приехала вовремя, водитель был очень вежливый, а поездка комфортной. Рекомендую всем, кто ищет надёжный трансфер в Стамбуле!',
      author: 'Ольга П., Россия',
    },
    {
      text: 'Трансфер из аэропорта Анталии в Аланью превзошел все ожидания! Чистый автомобиль, удобное сидение и дружелюбный водитель. Идеальный выбор для путешествий по Турции.',
      author: 'Иван С., Россия',
    },
    {
      text: 'Antalya Havalimanı’ndan Alanya’daki otelimize transferimiz harikaydı. Araç tertemizdi, şoför tam zamanında geldi ve oldukça nazikti. Kesinlikle tekrar tercih edeceğim bir hizmet!',
      author: 'Elif K., Türkiye',
    },
    {
      text: 'Bodrum Milas Havalimanı’ndan Bodrum merkezine olan transferimiz çok keyifli geçti. Yolculuk boyunca çok rahat ettik ve hizmet mükemmeldi. Teşekkür ederiz!',
      author: 'Ahmet D., Türkiye',
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