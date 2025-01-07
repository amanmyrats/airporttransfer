import { Component } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { PriceListComponent } from '../../components/price-list/price-list.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-prices',  
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    PriceListComponent,
    FooterComponent, 
  ],
  templateUrl: './prices.component.html',
  styleUrl: './prices.component.scss'
})
export class PricesComponent {

}
