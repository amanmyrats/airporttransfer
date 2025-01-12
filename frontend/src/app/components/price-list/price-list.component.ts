import { AfterViewInit, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { MainLocationService } from '../../services/main-location.service';
import { PopularRouteService } from '../../admin/services/popular-route.service';
import { CarTypeService } from '../../services/car-type.service';

@Component({
  selector: 'app-price-list',
  imports: [
    TabsModule, 
    CommonModule, 
  ],
  templateUrl: './price-list.component.html',
  styleUrl: './price-list.component.scss'
})
export class PriceListComponent implements OnInit, AfterViewInit {
  activeIndex: number = 1;
  mainLocationService = inject(MainLocationService);
  popularRouteService = inject(PopularRouteService);
  carTypeService = inject(CarTypeService);

  popularRoutesSignal = this.popularRouteService.popularRoutesSignal;
  
  mainLocations: any[] = this.mainLocationService.getMainLocations();

  constructor(
  ) {
    this.mainLocations = this.mainLocationService.getMainLocations();
    this.popularRouteService.updatePopularRoutesSignal();


    // Effect to filter main locations based on popularRoutesSignal
    effect(() => {
      const popularRoutes = this.popularRoutesSignal();
      const filteredMainLocations = this.mainLocationService.getMainLocations().filter(location =>
        popularRoutes.some(route => route.main_location === location.code)
      );
      this.mainLocations = filteredMainLocations;
    });
  }
  
  ngOnInit(): void {
  }

  bookRoute(route: string): void {
    console.log('Booked route: ', route);
  }

  ngAfterViewInit(): void {
    this.activeIndex = 2;
      
  }

}
