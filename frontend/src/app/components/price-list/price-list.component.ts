import { Component } from '@angular/core';

@Component({
  selector: 'app-price-list',
  imports: [],
  templateUrl: './price-list.component.html',
  styleUrl: './price-list.component.scss'
})
export class PriceListComponent {

  bookRoute(route: string): void {
    console.log('Booked route: ', route);
  }
}
