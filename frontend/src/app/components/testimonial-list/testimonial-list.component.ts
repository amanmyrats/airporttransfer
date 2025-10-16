import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonial-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-list.component.html',
  styleUrl: './testimonial-list.component.scss',
})
export class TestimonialListComponent {
  testimonials = [
    {
      text: 'Stress-Free Private Airport Transfer from Antalya to Alanya. Booking our private airport transfer from Antalya Airport to Alanya was a breeze! The driver was punctual, professional, and the ride was incredibly comfortable. I’ll definitely use this service again for stress-free airport transfers in Turkey!',
      author: 'Sarah J., United Kingdom',
    },
    {
      text: 'Premium 24/7 Private Airport Transfer in Istanbul. I needed a late-night transfer from Istanbul Airport to Taksim, and the service exceeded my expectations. The luxury car was spotless, the driver was courteous, and everything felt first-class. Highly recommend for Istanbul private airport transfers!',
      author: 'David L., United States',
    },
    {
      text: 'Bequemer & Pünktlicher Flughafentransfer von Antalya nach Side. Unser privater Flughafentransfer vom Antalya Flughafen nach Side war einfach perfekt! Der Fahrer war freundlich, professionell, das Auto komfortabel, und wir konnten unseren Strandurlaub stressfrei beginnen. Sehr empfehlenswert für Antalya Flughafentransfers!',
      author: 'Lisa M., Deutschland',
    },
    {
      text: 'Luxus-Flughafentransfer vom Bodrum Flughafen ins Zentrum. Unser Transfer vom Bodrum Milas Flughafen nach Bodrum Zentrum verlief reibungslos. Sehr professioneller und bequemer Service, genau das, was man nach einem langen Flug braucht. Danke für den besten Bodrum Flughafentransfer!',
      author: 'Markus W., Deutschland',
    },
    {
      text: 'Лучший частный трансфер из аэропорта Сабиха Гёкчен в Султанахмет. Заказывали частный трансфер из аэропорта Сабиха Гёкчен в Султанахмет. Машина приехала вовремя, водитель был очень вежливый, а поездка комфортной. Рекомендую всем, кто ищет надежный и удобный трансфер в Стамбуле!',
      author: 'Ольга П., Россия',
    },
    {
      text: 'Премиальный трансфер из аэропорта Анталии в Аланью. Частный трансфер из аэропорта Анталии в Аланью превзошел все ожидания! Чистый автомобиль, удобные сиденья, дружелюбный водитель. Идеальный выбор для путешествий по Турции.',
      author: 'Иван С., Россия',
    },
    {
      text: 'Antalya Havalimanı’ndan Alanya’ya 24/7 Özel Transfer. Antalya Havalimanı’ndan Alanya’daki otelimize transferimiz harikaydı. Araç tertemizdi, şoför tam zamanında geldi ve oldukça nazikti. Kesinlikle tekrar tercih edeceğim bir hizmet!',
      author: 'Elif K., Türkiye',
    },
    {
      text: 'Bodrum Havalimanı’ndan Merkeze Konforlu ve Lüks Transfer. Bodrum Milas Havalimanı’ndan Bodrum merkezine olan transferimiz çok keyifli geçti. Yolculuk boyunca çok rahat ettik ve hizmet mükemmeldi. Teşekkür ederiz!',
      author: 'Ahmet D., Türkiye',
    },
  ];
}
